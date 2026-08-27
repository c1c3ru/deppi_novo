#!/bin/bash
# ==============================================================================
# install-openvas.sh — Instalação Bare-Metal do OpenVAS / Greenbone Vulnerability
# Management (GVM) no Ubuntu 24.04 LTS, sem containers.
#
# Cobre: dependências de compilação, usuário de sistema, Redis (socket),
# PostgreSQL (role/db/extensões), build de gvm-libs/openvas-scanner/
# ospd-openvas/gvmd/gsa/gsad/notus-scanner/greenbone-feed-sync, units systemd,
# sincronização de feeds e criação do usuário admin.
#
# Diferenciais deste script em relação a rodar os comandos manualmente:
#   - Idempotente: cada etapa concluída é registrada em /var/lib/openvas-install/state
#     e etapas já feitas são puladas em uma nova execução (retomada após falha).
#   - Pacotes ausentes/renomeados: cada pacote apt é instalado individualmente;
#     pacotes "opcionais" (documentação/empacotamento) que falharem apenas geram
#     aviso, pacotes "críticos" abortam a etapa com relatório claro do que faltou.
#   - Fallback de compilação: se libpaho-mqtt-dev não existir nos repositórios,
#     a biblioteca é compilada a partir do código-fonte.
#   - Fallback Python: se a instalação via pip --break-system-packages falhar
#     (ambiente gerenciado/PEP 668 mais restrito), usa um virtualenv dedicado.
#   - Retentativas com backoff exponencial para operações de rede (apt, git, pip).
#   - Validações reais ao final de cada camada (Redis PONG, extensões do
#     PostgreSQL, status dos serviços systemd, gvmd --get-scanners).
#
# Uso:
#   sudo ./install-openvas.sh [opções]
#
# Opções:
#   --skip-feed-sync         Pula a sincronização de feeds (NVT/SCAP/CERT/gvmd-data).
#                             Pode ser rodada depois manualmente, veja o relatório final.
#   --clean                   Ignora o estado salvo e reexecuta todas as etapas.
#   --admin-password SENHA    Define a senha do usuário admin do GVM.
#                             Se omitido, uma senha aleatória é gerada e salva em
#                             /root/openvas-admin-credentials.txt (chmod 600).
#   -h, --help                 Mostra esta ajuda.
#
# Variáveis de ambiente opcionais (para fixar versões em produção):
#   GVM_LIBS_REF, OPENVAS_SCANNER_REF, OSPD_OPENVAS_REF, GVMD_REF, GSA_REF,
#   GSAD_REF, NOTUS_SCANNER_REF, FEED_SYNC_REF
#   Por padrão usam a branch principal de cada repositório. Antes de usar em
#   produção, confira https://github.com/greenbone e fixe tags testadas.
# ==============================================================================

set -uo pipefail

# ------------------------------------------------------------------------------
# Configuração geral
# ------------------------------------------------------------------------------
SOURCE_DIR="/opt/source"
PREFIX="/usr/local"
GVM_USER="gvm"
GVM_GROUP="gvm"
STATE_DIR="/var/lib/openvas-install"
STATE_FILE="$STATE_DIR/state"
LOG_FILE="/var/log/openvas-install.log"
REDIS_SOCK="/run/redis/redis-server.sock"
GVM_RUN_DIR="/run/gvm"
OSPD_SOCK="$GVM_RUN_DIR/ospd-openvas.sock"
DB_NAME="gvmd"
DB_ROLE="gvm"
ADMIN_USER="admin"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
VENV_DIR="/opt/gvm-venv"
CRED_FILE="/root/openvas-admin-credentials.txt"

SKIP_FEED_SYNC=0
CLEAN_INSTALL=0

GVM_LIBS_REF="${GVM_LIBS_REF:-}"
OPENVAS_SCANNER_REF="${OPENVAS_SCANNER_REF:-}"
OSPD_OPENVAS_REF="${OSPD_OPENVAS_REF:-}"
GVMD_REF="${GVMD_REF:-}"
GSA_REF="${GSA_REF:-}"
GSAD_REF="${GSAD_REF:-}"
NOTUS_SCANNER_REF="${NOTUS_SCANNER_REF:-}"
FEED_SYNC_REF="${FEED_SYNC_REF:-}"

# Caminhos resolvidos dinamicamente (podem virar o venv, se pip do sistema falhar)
OSPD_BIN=""
FEED_SYNC_BIN=""

WARNINGS=()

# ------------------------------------------------------------------------------
# Utilitários de log
# ------------------------------------------------------------------------------
log()   { echo -e "\033[1;32m[INFO]\033[0m  $*" | tee -a "$LOG_FILE"; }
warn()  { echo -e "\033[1;33m[AVISO]\033[0m $*" | tee -a "$LOG_FILE"; WARNINGS+=("$*"); }
err()   { echo -e "\033[1;31m[ERRO]\033[0m  $*" | tee -a "$LOG_FILE" >&2; }
fatal() { err "$*"; err "Consulte $LOG_FILE para detalhes. Corrija o problema e rode o script novamente (ele retoma de onde parou)."; exit 1; }

# ------------------------------------------------------------------------------
# Estado (idempotência)
# ------------------------------------------------------------------------------
step_done() {
  [ -f "$STATE_FILE" ] && grep -qxF "$1" "$STATE_FILE"
}

mark_done() {
  echo "$1" >> "$STATE_FILE"
}

run_step() {
  local name="$1"; shift
  if [ "$CLEAN_INSTALL" -eq 0 ] && step_done "$name"; then
    log "Etapa '$name' já concluída anteriormente — pulando (use --clean para refazer)."
    return 0
  fi
  log "==> Iniciando etapa: $name"
  if "$@"; then
    mark_done "$name"
    log "==> Etapa concluída: $name"
    return 0
  else
    return 1
  fi
}

# ------------------------------------------------------------------------------
# Retentativa com backoff exponencial (operações de rede)
# ------------------------------------------------------------------------------
retry() {
  local max_attempts=5 delay=3 attempt=1
  until "$@"; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      return 1
    fi
    warn "Comando falhou (tentativa $attempt/$max_attempts): $* — nova tentativa em ${delay}s"
    sleep "$delay"
    delay=$((delay * 2))
    attempt=$((attempt + 1))
  done
  return 0
}

# ------------------------------------------------------------------------------
# Pré-requisitos
# ------------------------------------------------------------------------------
require_root() {
  if [ "$EUID" -ne 0 ]; then
    fatal "Este script precisa ser executado como root (use: sudo ./install-openvas.sh)."
  fi
}

check_os() {
  if [ -r /etc/os-release ]; then
    . /etc/os-release
    if [ "${ID:-}" != "ubuntu" ]; then
      warn "Sistema detectado: ${PRETTY_NAME:-desconhecido}. Este script foi desenhado para Ubuntu 24.04; prosseguindo mesmo assim."
    elif [ "${VERSION_ID:-}" != "24.04" ]; then
      warn "Ubuntu ${VERSION_ID:-desconhecido} detectado (script validado em 24.04). Prosseguindo mesmo assim."
    fi
  else
    warn "Não foi possível detectar a distribuição (/etc/os-release ausente). Prosseguindo mesmo assim."
  fi
}

# ------------------------------------------------------------------------------
# Etapa: pacotes do sistema
# ------------------------------------------------------------------------------
# Pacotes críticos: sem eles a compilação/execução do GVM não funciona.
CORE_PACKAGES=(
  build-essential cmake pkg-config gcc g++ make bison flex git curl wget
  gnupg ca-certificates rsync sudo redis-server postgresql postgresql-contrib
  postgresql-server-dev-all libglib2.0-dev libgnutls28-dev libgcrypt20-dev
  libssh-dev libldap2-dev libradcli-dev libpcap-dev libksba-dev libsnmp-dev
  libgpgme-dev libjson-glib-dev libcurl4-gnutls-dev libbsd-dev libical-dev
  libxml2-dev libxslt1-dev libmicrohttpd-dev libhiredis-dev libnet1-dev
  libpopt-dev libunistring-dev libsqlite3-dev libpq-dev python3 python3-pip
  python3-setuptools python3-packaging python3-lxml python3-defusedxml
  python3-paramiko python3-psutil python3-venv python3-dev xsltproc uuid-dev
  libpaho-mqtt-dev
)

# Pacotes opcionais: usados para empacotamento/documentação/PDF. A falta deles
# não impede o funcionamento do scanner, gerenciador ou interface web.
OPTIONAL_PACKAGES=(
  vim xml-twig-tools texlive-latex-base texlive-latex-extra
  texlive-fonts-recommended xmlstarlet doxygen graphviz clang-format
  fakeroot alien
)

# Nomes de pacotes que mudaram entre versões do Ubuntu/Debian.
declare -A PKG_ALTERNATIVES=(
  [libssh-gcrypt-dev]="libssh-dev"
  [xml-twig-tools]="libxml-twig-perl"
)

apt_install_one() {
  local pkg="$1"
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$pkg" >>"$LOG_FILE" 2>&1
}

install_package_list() {
  local -n _list="$1"
  local critical="$2"
  local failed=()

  for pkg in "${_list[@]}"; do
    if dpkg -s "$pkg" >/dev/null 2>&1; then
      continue
    fi
    log "Instalando pacote: $pkg"
    if retry apt_install_one "$pkg"; then
      continue
    fi
    local alt="${PKG_ALTERNATIVES[$pkg]:-}"
    if [ -n "$alt" ] && retry apt_install_one "$alt"; then
      log "Pacote '$pkg' não disponível; usado substituto '$alt' com sucesso."
      continue
    fi
    failed+=("$pkg")
  done

  if [ ${#failed[@]} -gt 0 ]; then
    if [ "$critical" = "critical" ]; then
      err "Pacotes críticos que não puderam ser instalados: ${failed[*]}"
      err "Verifique o nome exato no seu release do Ubuntu (apt-cache search <termo>) e instale manualmente, depois rode o script novamente."
      return 1
    else
      warn "Pacotes opcionais não instalados (empacotamento/documentação, sem impacto funcional): ${failed[*]}"
    fi
  fi
  return 0
}

build_paho_mqtt_from_source() {
  if dpkg -s libpaho-mqtt-dev >/dev/null 2>&1 || [ -f /usr/local/lib/libpaho-mqtt3as.so ] || [ -f /usr/lib/x86_64-linux-gnu/libpaho-mqtt3as.so ]; then
    return 0
  fi
  warn "libpaho-mqtt-dev não encontrado nos repositórios; compilando Eclipse Paho MQTT C a partir do código-fonte."
  local dir="$SOURCE_DIR/paho.mqtt.c"
  mkdir -p "$SOURCE_DIR"
  if [ ! -d "$dir" ]; then
    retry git clone --depth 1 https://github.com/eclipse/paho.mqtt.c.git "$dir" >>"$LOG_FILE" 2>&1 || return 1
  fi
  (
    cd "$dir" || exit 1
    mkdir -p build && cd build || exit 1
    cmake .. -DPAHO_WITH_SSL=ON -DPAHO_BUILD_STATIC=ON -DCMAKE_INSTALL_PREFIX=/usr >>"$LOG_FILE" 2>&1 &&
      make -j"$(nproc)" >>"$LOG_FILE" 2>&1 &&
      make install >>"$LOG_FILE" 2>&1
  ) || return 1
  ldconfig
  return 0
}

step_system_update() {
  log "Atualizando índice de pacotes..."
  retry env DEBIAN_FRONTEND=noninteractive apt-get update -y >>"$LOG_FILE" 2>&1 || { err "Falha ao rodar apt-get update."; return 1; }
  DEBIAN_FRONTEND=noninteractive apt-get upgrade -y >>"$LOG_FILE" 2>&1 || warn "apt-get upgrade retornou erro; prosseguindo (pacotes já instalados não são bloqueantes)."
  return 0
}

step_install_packages() {
  install_package_list CORE_PACKAGES critical || return 1
  build_paho_mqtt_from_source || { err "Falha ao compilar libpaho-mqtt a partir do código-fonte."; return 1; }
  install_package_list OPTIONAL_PACKAGES optional
  for cmd in gcc g++ make cmake git pkg-config python3; do
    command -v "$cmd" >/dev/null 2>&1 || { err "Ferramenta essencial ausente após instalação: $cmd"; return 1; }
  done
  return 0
}

step_install_nodejs() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    local major
    major=$(node -v | sed 's/^v//' | cut -d. -f1)
    if [ "$major" -ge 18 ]; then
      log "Node.js $(node -v) já instalado."
    else
      warn "Node.js $(node -v) é antigo; tentando atualizar via NodeSource."
    fi
  fi
  if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/^v//' | cut -d. -f1)" -lt 18 ]; then
    if retry bash -c 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -' >>"$LOG_FILE" 2>&1; then
      retry apt_install_one nodejs || return 1
    else
      warn "Falha ao configurar repositório NodeSource; usando pacote nodejs padrão do Ubuntu."
      retry apt_install_one nodejs || return 1
      retry apt_install_one npm || true
    fi
  fi
  if ! command -v yarn >/dev/null 2>&1; then
    retry npm install -g yarn >>"$LOG_FILE" 2>&1 || { err "Falha ao instalar yarn via npm."; return 1; }
  fi
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: usuário de sistema e diretórios
# ------------------------------------------------------------------------------
step_create_user() {
  if ! getent group "$GVM_GROUP" >/dev/null; then
    groupadd --system "$GVM_GROUP"
  fi
  if ! id "$GVM_USER" >/dev/null 2>&1; then
    useradd -r -M -g "$GVM_GROUP" -G redis -s /usr/sbin/nologin "$GVM_USER"
  else
    usermod -aG redis "$GVM_USER" 2>>"$LOG_FILE" || true
  fi
  mkdir -p /var/lib/gvm /var/log/gvm "$GVM_RUN_DIR"
  chown -R "$GVM_USER":"$GVM_GROUP" /var/lib/gvm /var/log/gvm "$GVM_RUN_DIR"
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: Redis (socket Unix)
# ------------------------------------------------------------------------------
step_configure_redis() {
  local conf="/etc/redis/redis.conf"
  [ -f "$conf" ] || { err "Arquivo de configuração do Redis não encontrado em $conf."; return 1; }

  if [ ! -f "${conf}.bak" ]; then
    cp "$conf" "${conf}.bak"
  fi

  grep -q '^supervised systemd' "$conf" || echo 'supervised systemd' >> "$conf"
  sed -i '/^unixsocket /d;/^# *unixsocket /d' "$conf"
  sed -i '/^unixsocketperm /d;/^# *unixsocketperm /d' "$conf"
  {
    echo "unixsocket $REDIS_SOCK"
    echo "unixsocketperm 770"
  } >> "$conf"

  usermod -aG redis "$GVM_USER" 2>>"$LOG_FILE" || true

  # /run é tmpfs: garante o diretório do socket já na próxima inicialização
  # (systemd RuntimeDirectory do pacote pode não cobrir o caminho customizado).
  local sock_dir
  sock_dir=$(dirname "$REDIS_SOCK")
  mkdir -p "$sock_dir"
  chown redis:redis "$sock_dir" 2>>"$LOG_FILE" || true
  echo "d $sock_dir 0770 redis redis -" > /etc/tmpfiles.d/openvas-redis.conf
  systemd-tmpfiles --create /etc/tmpfiles.d/openvas-redis.conf >>"$LOG_FILE" 2>&1 || true

  systemctl restart redis-server || { err "Falha ao reiniciar redis-server."; return 1; }
  systemctl enable redis-server >>"$LOG_FILE" 2>&1 || true

  local waited=0
  while [ ! -S "$REDIS_SOCK" ] && [ "$waited" -lt 15 ]; do
    sleep 1
    waited=$((waited + 1))
  done
  [ -S "$REDIS_SOCK" ] || { err "Socket do Redis não apareceu em $REDIS_SOCK."; return 1; }

  if ! sudo -u "$GVM_USER" redis-cli -s "$REDIS_SOCK" ping 2>>"$LOG_FILE" | grep -q PONG; then
    err "Redis não respondeu PONG pelo socket $REDIS_SOCK para o usuário $GVM_USER."
    return 1
  fi
  log "Redis respondendo corretamente via socket Unix."
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: PostgreSQL (role, banco, extensões)
# ------------------------------------------------------------------------------
step_configure_postgresql() {
  systemctl enable --now postgresql >>"$LOG_FILE" 2>&1 || { err "Falha ao iniciar o PostgreSQL."; return 1; }

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_ROLE}'" | grep -q 1; then
    sudo -u postgres createuser -DRS "$DB_ROLE" || { err "Falha ao criar role '$DB_ROLE' no PostgreSQL."; return 1; }
  fi

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres createdb -O "$DB_ROLE" "$DB_NAME" || { err "Falha ao criar banco '$DB_NAME'."; return 1; }
  fi

  sudo -u postgres psql "$DB_NAME" >>"$LOG_FILE" 2>&1 <<SQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_ROLE;
SQL
  if [ $? -ne 0 ]; then
    err "Falha ao criar extensões uuid-ossp/pgcrypto no banco $DB_NAME."
    return 1
  fi

  if ! sudo -u "$GVM_USER" psql "$DB_NAME" -c "SELECT gen_random_uuid();" >>"$LOG_FILE" 2>&1; then
    err "Usuário do sistema '$GVM_USER' não conseguiu autenticar no PostgreSQL via peer."
    err "Verifique /etc/postgresql/*/main/pg_hba.conf (linha 'local all all peer') e se a role '$DB_ROLE' existe."
    return 1
  fi
  log "PostgreSQL configurado e validado (role, banco, extensões, autenticação peer)."
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: código-fonte
# ------------------------------------------------------------------------------
REPOS=(
  "gvm-libs|https://github.com/greenbone/gvm-libs.git|GVM_LIBS_REF"
  "openvas-scanner|https://github.com/greenbone/openvas-scanner.git|OPENVAS_SCANNER_REF"
  "ospd-openvas|https://github.com/greenbone/ospd-openvas.git|OSPD_OPENVAS_REF"
  "gvmd|https://github.com/greenbone/gvmd.git|GVMD_REF"
  "gsa|https://github.com/greenbone/gsa.git|GSA_REF"
  "gsad|https://github.com/greenbone/gsad.git|GSAD_REF"
  "notus-scanner|https://github.com/greenbone/notus-scanner.git|NOTUS_SCANNER_REF"
  "greenbone-feed-sync|https://github.com/greenbone/greenbone-feed-sync.git|FEED_SYNC_REF"
)

step_clone_sources() {
  mkdir -p "$SOURCE_DIR"
  local entry name url ref_var ref dir
  for entry in "${REPOS[@]}"; do
    IFS='|' read -r name url ref_var <<< "$entry"
    ref="${!ref_var}"
    dir="$SOURCE_DIR/$name"
    if [ -d "$dir/.git" ]; then
      log "Atualizando repositório existente: $name"
      (cd "$dir" && retry git fetch --all --tags >>"$LOG_FILE" 2>&1) || { err "Falha ao atualizar $name."; return 1; }
    else
      log "Clonando repositório: $name"
      retry git clone "$url" "$dir" >>"$LOG_FILE" 2>&1 || { err "Falha ao clonar $name."; return 1; }
    fi
    if [ -n "$ref" ]; then
      (cd "$dir" && git checkout "$ref" >>"$LOG_FILE" 2>&1) || { err "Falha ao mudar $name para '$ref'."; return 1; }
    fi
  done
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: compilação (cmake) — genérica com relatório de log em falha
# ------------------------------------------------------------------------------
cmake_build_install() {
  local component="$1"; shift
  local dir="$SOURCE_DIR/$component"
  [ -d "$dir" ] || { err "Diretório de fontes não encontrado: $dir"; return 1; }
  (
    cd "$dir" || exit 1
    mkdir -p build
    cd build || exit 1
    cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX="$PREFIX" "$@" >>"$LOG_FILE" 2>&1 &&
      make -j"$(nproc)" >>"$LOG_FILE" 2>&1 &&
      make install >>"$LOG_FILE" 2>&1
  )
  local rc=$?
  if [ $rc -ne 0 ]; then
    err "Falha ao compilar '$component'. Últimas linhas do log:"
    tail -n 40 "$LOG_FILE" >&2
    return 1
  fi
  ldconfig
  return 0
}

step_build_gvm_libs() {
  cmake_build_install gvm-libs || return 1
}

step_build_openvas_scanner() {
  cmake_build_install openvas-scanner -DOPENVAS_DEFAULT_SOCKET="$REDIS_SOCK" || return 1
  mkdir -p /var/lib/openvas /var/log/openvas
  chown -R "$GVM_USER":"$GVM_GROUP" /var/lib/openvas /var/log/openvas
  local bin_ok=0
  for candidate in /usr/local/sbin/openvas /usr/local/bin/openvas; do
    [ -x "$candidate" ] && bin_ok=1
  done
  [ "$bin_ok" -eq 1 ] || { err "Binário 'openvas' não encontrado após instalação."; return 1; }
  return 0
}

# ------------------------------------------------------------------------------
# Instalação de componentes Python com fallback para virtualenv
# ------------------------------------------------------------------------------
# Resolve o caminho de um binário Python já instalado (sistema ou virtualenv).
# Usado tanto logo após instalar quanto em execuções retomadas, onde a etapa de
# instalação pode ter sido pulada e nenhuma variável em memória aponta pra ele.
resolve_component_bin() {
  local bin_name="$1"
  if command -v "$bin_name" >/dev/null 2>&1; then
    command -v "$bin_name"
    return 0
  fi
  if [ -x "$VENV_DIR/bin/$bin_name" ]; then
    echo "$VENV_DIR/bin/$bin_name"
    return 0
  fi
  return 1
}

install_python_component() {
  local dir="$1" bin_name="$2"
  (cd "$dir" && python3 -m pip install --break-system-packages --upgrade . >>"$LOG_FILE" 2>&1)
  if [ $? -eq 0 ] && command -v "$bin_name" >/dev/null 2>&1; then
    return 0
  fi
  warn "Instalação via pip do sistema falhou para '$dir'; usando virtualenv dedicado em $VENV_DIR."
  if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR" >>"$LOG_FILE" 2>&1 || { err "Falha ao criar virtualenv $VENV_DIR."; return 1; }
  fi
  "$VENV_DIR/bin/pip" install --upgrade pip >>"$LOG_FILE" 2>&1
  (cd "$dir" && "$VENV_DIR/bin/pip" install --upgrade . >>"$LOG_FILE" 2>&1) || { err "Falha ao instalar '$dir' no virtualenv."; return 1; }
  if [ -x "$VENV_DIR/bin/$bin_name" ]; then
    chown -R "$GVM_USER":"$GVM_GROUP" "$VENV_DIR"
    return 0
  fi
  err "Binário '$bin_name' não encontrado nem no sistema nem no virtualenv."
  return 1
}

step_install_ospd_openvas() {
  install_python_component "$SOURCE_DIR/ospd-openvas" "ospd-openvas" || return 1
  OSPD_BIN=$(resolve_component_bin ospd-openvas) || { err "ospd-openvas instalado mas binário não localizado."; return 1; }
  log "ospd-openvas instalado em: $OSPD_BIN"
  return 0
}

step_install_notus_scanner() {
  install_python_component "$SOURCE_DIR/notus-scanner" "notus-scanner" || {
    warn "Falha ao instalar notus-scanner; scans continuarão funcionando, mas sem notificações baseadas em Notus."
    return 0
  }
  return 0
}

step_install_feed_sync() {
  install_python_component "$SOURCE_DIR/greenbone-feed-sync" "greenbone-feed-sync" || return 1
  FEED_SYNC_BIN=$(resolve_component_bin greenbone-feed-sync) || { err "greenbone-feed-sync instalado mas binário não localizado."; return 1; }
  log "greenbone-feed-sync instalado em: $FEED_SYNC_BIN"
  return 0
}

step_build_gvmd() {
  cmake_build_install gvmd || return 1
  mkdir -p /var/lib/gvm/gvmd /var/log/gvm/gvmd
  chown -R "$GVM_USER":"$GVM_GROUP" /var/lib/gvm /var/log/gvm
  [ -x /usr/local/sbin/gvmd ] || { err "Binário 'gvmd' não encontrado após instalação."; return 1; }
  return 0
}

step_build_gsa() {
  local dir="$SOURCE_DIR/gsa"
  (
    cd "$dir" || exit 1
    retry yarn install --frozen-lockfile >>"$LOG_FILE" 2>&1 || retry yarn install >>"$LOG_FILE" 2>&1
  ) || { err "Falha ao instalar dependências JavaScript do GSA (yarn). Verifique conectividade e versão do Node.js."; return 1; }
  (cd "$dir" && yarn build >>"$LOG_FILE" 2>&1) || { err "Falha ao gerar build do GSA (front-end)."; return 1; }
  return 0
}

step_build_gsad() {
  cmake_build_install gsad || return 1
  [ -x /usr/local/sbin/gsad ] || { err "Binário 'gsad' não encontrado após instalação."; return 1; }
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: units systemd
# ------------------------------------------------------------------------------
write_unit() {
  local path="$1" content="$2"
  echo "$content" > "$path"
}

step_create_systemd_units() {
  OSPD_BIN=$(resolve_component_bin ospd-openvas) || { err "Binário ospd-openvas não localizado (nem sistema, nem $VENV_DIR). Rode a etapa 'install-ospd-openvas' novamente."; return 1; }

  write_unit /etc/systemd/system/ospd-openvas.service "$(cat <<EOF
[Unit]
Description=OSPD OpenVAS
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=simple
User=$GVM_USER
Group=$GVM_GROUP
RuntimeDirectory=gvm
ExecStart=$OSPD_BIN --foreground --unix-socket $OSPD_SOCK --pid-file $GVM_RUN_DIR/ospd-openvas.pid --log-file /var/log/gvm/ospd-openvas.log
Restart=always

[Install]
WantedBy=multi-user.target
EOF
)"

  write_unit /etc/systemd/system/gvmd.service "$(cat <<EOF
[Unit]
Description=Greenbone Vulnerability Manager daemon
After=network.target postgresql.service ospd-openvas.service
Requires=postgresql.service ospd-openvas.service

[Service]
Type=simple
User=$GVM_USER
Group=$GVM_GROUP
RuntimeDirectory=gvm
ExecStart=/usr/local/sbin/gvmd --foreground --osp-vt-update=$OSPD_SOCK
Restart=always

[Install]
WantedBy=multi-user.target
EOF
)"

  write_unit /etc/systemd/system/gsad.service "$(cat <<EOF
[Unit]
Description=Greenbone Security Assistant daemon
After=network.target gvmd.service
Requires=gvmd.service

[Service]
Type=simple
User=$GVM_USER
Group=$GVM_GROUP
ExecStart=/usr/local/sbin/gsad --foreground --listen=0.0.0.0 --port=9392
Restart=always

[Install]
WantedBy=multi-user.target
EOF
)"

  systemctl daemon-reload
  systemctl enable --now ospd-openvas >>"$LOG_FILE" 2>&1 || { err "Falha ao iniciar ospd-openvas."; return 1; }
  wait_for_socket "$OSPD_SOCK" 30 || { err "Socket do ospd-openvas não apareceu em $OSPD_SOCK."; return 1; }

  systemctl enable --now gvmd >>"$LOG_FILE" 2>&1 || { err "Falha ao iniciar gvmd."; return 1; }
  systemctl enable --now gsad >>"$LOG_FILE" 2>&1 || { err "Falha ao iniciar gsad."; return 1; }

  local waited=0
  while ! systemctl is-active --quiet gvmd && [ "$waited" -lt 30 ]; do sleep 1; waited=$((waited + 1)); done
  systemctl is-active --quiet gvmd || { err "gvmd não ficou ativo. Veja: journalctl -u gvmd -n 100 --no-pager"; return 1; }

  waited=0
  while ! systemctl is-active --quiet gsad && [ "$waited" -lt 30 ]; do sleep 1; waited=$((waited + 1)); done
  systemctl is-active --quiet gsad || { err "gsad não ficou ativo. Veja: journalctl -u gsad -n 100 --no-pager"; return 1; }

  return 0
}

wait_for_socket() {
  local sock="$1" max="$2" waited=0
  while [ ! -S "$sock" ] && [ "$waited" -lt "$max" ]; do
    sleep 1
    waited=$((waited + 1))
  done
  [ -S "$sock" ]
}

# ------------------------------------------------------------------------------
# Etapa: sincronização de feeds
# ------------------------------------------------------------------------------
step_sync_feeds() {
  FEED_SYNC_BIN=$(resolve_component_bin greenbone-feed-sync) || { err "Binário greenbone-feed-sync não localizado (nem sistema, nem $VENV_DIR). Rode a etapa 'install-feed-sync' novamente."; return 1; }

  if [ "$SKIP_FEED_SYNC" -eq 1 ]; then
    warn "Sincronização de feeds pulada por --skip-feed-sync. Rode depois com: sudo -u $GVM_USER $FEED_SYNC_BIN --type all"
    return 0
  fi
  local type
  for type in nvt scap cert gvmd-data; do
    log "Sincronizando feed '$type' (isso pode demorar bastante na primeira execução)..."
    if ! retry sudo -u "$GVM_USER" "$FEED_SYNC_BIN" --type "$type" >>"$LOG_FILE" 2>&1; then
      warn "Falha ao sincronizar feed '$type'. Rode manualmente depois: sudo -u $GVM_USER $FEED_SYNC_BIN --type $type"
    fi
  done
  systemctl restart ospd-openvas gvmd gsad
  return 0
}

# ------------------------------------------------------------------------------
# Etapa: usuário administrador
# ------------------------------------------------------------------------------
step_create_admin_user() {
  if sudo -u "$GVM_USER" gvmd --get-users --verbose 2>>"$LOG_FILE" | grep -q "^${ADMIN_USER} "; then
    log "Usuário admin '$ADMIN_USER' já existe; mantendo senha atual."
    return 0
  fi
  if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$(openssl rand -base64 18)
  fi
  sudo -u "$GVM_USER" gvmd --create-user="$ADMIN_USER" >>"$LOG_FILE" 2>&1 || { err "Falha ao criar usuário admin."; return 1; }
  sudo -u "$GVM_USER" gvmd --user="$ADMIN_USER" --new-password="$ADMIN_PASSWORD" >>"$LOG_FILE" 2>&1 || { err "Falha ao definir senha do admin."; return 1; }

  cat > "$CRED_FILE" <<EOF
Usuário: $ADMIN_USER
Senha:   $ADMIN_PASSWORD
Interface: https://$(hostname -I 2>/dev/null | awk '{print $1}'):9392
EOF
  chmod 600 "$CRED_FILE"
  log "Credenciais do admin salvas em $CRED_FILE (permissão 600)."
  return 0
}

# ------------------------------------------------------------------------------
# Relatório final
# ------------------------------------------------------------------------------
final_report() {
  echo ""
  echo "===================================================================="
  echo " RELATÓRIO FINAL — Instalação OpenVAS/GVM"
  echo "===================================================================="

  local redis_ok=FALHOU postgres_ok=FALHOU scanner_ok=FALHOU
  sudo -u "$GVM_USER" redis-cli -s "$REDIS_SOCK" ping 2>/dev/null | grep -q PONG && redis_ok=OK
  sudo -u "$GVM_USER" psql "$DB_NAME" -c '\dx' >/dev/null 2>&1 && postgres_ok=OK
  sudo -u "$GVM_USER" gvmd --get-scanners >/dev/null 2>&1 && scanner_ok=OK

  printf "%-25s %s\n" "Redis (socket)" "$redis_ok"
  printf "%-25s %s\n" "PostgreSQL (extensões)" "$postgres_ok"
  printf "%-25s %s\n" "gvmd --get-scanners" "$scanner_ok"
  for svc in redis-server postgresql ospd-openvas gvmd gsad; do
    printf "%-25s %s\n" "$svc" "$(systemctl is-active "$svc" 2>/dev/null)"
  done

  echo ""
  if [ "$SKIP_FEED_SYNC" -eq 1 ]; then
    local feed_bin
    feed_bin=$(resolve_component_bin greenbone-feed-sync 2>/dev/null || echo "greenbone-feed-sync")
    echo "Feeds: NÃO sincronizados (--skip-feed-sync). Rode manualmente:"
    echo "  sudo -u $GVM_USER $feed_bin --type all"
  fi
  if [ -f "$CRED_FILE" ]; then
    echo "Credenciais do administrador em: $CRED_FILE"
  fi
  echo "Interface web: https://$(hostname -I 2>/dev/null | awk '{print $1}'):9392"
  echo ""
  if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo "Avisos durante a instalação (${#WARNINGS[@]}):"
    local w
    for w in "${WARNINGS[@]}"; do echo "  - $w"; done
  fi
  echo ""
  echo "Diagnóstico rápido em caso de problema futuro:"
  echo "  sudo -u $GVM_USER redis-cli -s $REDIS_SOCK ping"
  echo "  sudo -u $GVM_USER psql $DB_NAME -c '\\dx'"
  echo "  systemctl is-active redis-server postgresql ospd-openvas gvmd gsad"
  echo "  sudo journalctl -u ospd-openvas -n 80 --no-pager"
  echo "  sudo journalctl -u gvmd -n 80 --no-pager"
  echo "  sudo journalctl -u gsad -n 80 --no-pager"
  echo "  sudo -u $GVM_USER gvmd --get-scanners"
  echo "===================================================================="
}

# ------------------------------------------------------------------------------
# Parsing de argumentos
# ------------------------------------------------------------------------------
usage() {
  sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --skip-feed-sync) SKIP_FEED_SYNC=1 ;;
    --clean) CLEAN_INSTALL=1 ;;
    --admin-password) shift; ADMIN_PASSWORD="${1:-}" ;;
    -h|--help) usage; exit 0 ;;
    *) err "Opção desconhecida: $1"; usage; exit 1 ;;
  esac
  shift
done

# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------
main() {
  require_root
  mkdir -p "$STATE_DIR"
  touch "$LOG_FILE"
  [ "$CLEAN_INSTALL" -eq 1 ] && : > "$STATE_FILE"

  log "Log completo em: $LOG_FILE"
  check_os

  run_step "system-update" step_system_update || fatal "Falha ao atualizar o sistema."
  run_step "install-packages" step_install_packages || fatal "Falha ao instalar pacotes obrigatórios do sistema."
  run_step "install-nodejs" step_install_nodejs || fatal "Falha ao instalar Node.js/Yarn (necessário para o build do GSA)."
  run_step "create-user" step_create_user || fatal "Falha ao criar usuário/diretórios do GVM."
  run_step "configure-redis" step_configure_redis || fatal "Falha ao configurar o Redis (socket Unix)."
  run_step "configure-postgresql" step_configure_postgresql || fatal "Falha ao configurar o PostgreSQL."
  run_step "clone-sources" step_clone_sources || fatal "Falha ao obter o código-fonte do GVM."
  run_step "build-gvm-libs" step_build_gvm_libs || fatal "Falha ao compilar gvm-libs."
  run_step "build-openvas-scanner" step_build_openvas_scanner || fatal "Falha ao compilar o openvas-scanner."
  run_step "install-ospd-openvas" step_install_ospd_openvas || fatal "Falha ao instalar o ospd-openvas."
  run_step "install-notus-scanner" step_install_notus_scanner || true
  run_step "install-feed-sync" step_install_feed_sync || fatal "Falha ao instalar o greenbone-feed-sync."
  run_step "build-gvmd" step_build_gvmd || fatal "Falha ao compilar o gvmd."
  run_step "build-gsa" step_build_gsa || fatal "Falha ao gerar o build do GSA (interface web)."
  run_step "build-gsad" step_build_gsad || fatal "Falha ao compilar o gsad."
  run_step "systemd-units" step_create_systemd_units || fatal "Falha ao subir os serviços systemd. Verifique os logs indicados acima."
  run_step "sync-feeds" step_sync_feeds || true
  run_step "create-admin-user" step_create_admin_user || fatal "Falha ao criar o usuário administrador do GVM."

  final_report
}

main "$@"
