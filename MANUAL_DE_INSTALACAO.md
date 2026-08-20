# Manual de Instalação e Configuração DEPPI (Ambiente de Produção)

Este é o guia definitivo passo a passo para preparar o seu servidor Linux (Ubuntu 22.04+) e configurar o ambiente redondinho para rodar o DEPPI via Docker Compose pelo GitHub Actions.

## Passo 1: Atualização do Servidor e Instalações Básicas

Acesse o seu servidor via SSH e rode:

```bash
# Atualize os pacotes do servidor
sudo apt update && sudo apt upgrade -y

# Instale os pacotes necessários
sudo apt install -y curl git apt-transport-https ca-certificates software-properties-common
```

## Passo 2: Instalação do Docker e Docker Compose

O DEPPI usa o `docker-compose.yml` em produção, então você não precisa instalar Node.js ou Nginx nativamente se não quiser. O Docker vai cuidar de tudo.

```bash
# Adicionar a chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar o repositório do Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar o Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## Passo 3: Configurando Permissões Corretas para o Usuário (Muito Importante!)

Para que o GitHub Actions consiga fazer o deploy automático sem esbarrar em "Permission denied", o usuário que está rodando o runner precisa ter as permissões adequadas:

**3.1. Adicionar o usuário ao grupo do Docker**
Isso evita o erro `permission denied while trying to connect to the Docker daemon socket`:
```bash
sudo usermod -aG docker nor
sudo usermod -aG docker deppi
```

**3.2. Configurar o `sudo` sem senha para os comandos de deploy**
O pipeline do Github Actions precisa limpar pastas velhas. Para isso, precisamos que o usuário do Runner consiga executar comandos administrativos sem travar esperando senha.
```bash
echo "nor ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/nor
sudo chmod 0440 /etc/sudoers.d/nor

echo "deppi ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/deppi
sudo chmod 0440 /etc/sudoers.d/deppi
```

**3.3. Aplicar as Permissões do Docker (REINICIAR)**
Após adicionar os usuários ao grupo `docker`, as permissões só entram em vigor se você reiniciar o serviço do runner ou a máquina. A forma mais simples de garantir que tudo vai iniciar 100% liso é reiniciando o servidor:
```bash
sudo reboot
```

## Passo 4: Instalação do GitHub Actions Runner (Se aplicável)

Caso ainda não tenha configurado o GitHub Actions Runner (ou precise reinstalar):
1. Vá até o seu repositório no GitHub: **Settings > Actions > Runners**.
2. Clique em **New self-hosted runner**.
3. Escolha **Linux** e siga os comandos na tela (fazer o Download e Configure).
4. Para rodar em background para sempre, instale como serviço:
```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

## Passo 5: Variáveis de Ambiente no GitHub

Vá no seu GitHub em **Settings > Secrets and variables > Actions** e cadastre as seguintes `New repository secret` (caso ainda não tenha feito):

- `DB_PASSWORD` (Ex: uma senha segura como `MinhaSenhaSuperForte123`)
- `JWT_SECRET` (Gere com: `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` (Gere com: `openssl rand -hex 32`)
- `SESSION_SECRET` (Gere com: `openssl rand -hex 32`)

*(E qualquer outra variável que queira esconder, como `SMTP_PASS` do envio de emails).*

## Conclusão

Após esses 5 passos:
1. Seu servidor tem Docker atualizado.
2. Seu usuário tem acesso ao Docker sem root (nunca mais dará erro do `docker.sock`).
3. Seu usuário não tem bloqueios de senha no Sudo (nunca mais dará erro no `chown`).
4. O GitHub sabe se comunicar perfeitamente com o seu Servidor.

Basta fazer um "Re-run jobs" no GitHub Actions e a Pipeline fará o Pull do código, configurará o `.env` e o Docker subirá o Backend, Frontend, Postgres e tudo mais perfeitamente.
