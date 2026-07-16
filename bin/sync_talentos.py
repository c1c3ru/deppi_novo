import csv
import json
import urllib.request
import re
import os
import time
from io import StringIO
import hashlib

CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRuC5jSqZ72h5nfHUoqUN6QhIyN9DVXJdz5GVlmJs1_WAC1seOEouEnIr4LHmZurM7dfhTGyWdlkGUD/pub?output=csv"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'data', 'talentos.json')

def slugify(text):
    text = text.lower()
    text = re.sub(r'[áàâã]', 'a', text)
    text = re.sub(r'[éèê]', 'e', text)
    text = re.sub(r'[íìî]', 'i', text)
    text = re.sub(r'[óòôõ]', 'o', text)
    text = re.sub(r'[úùû]', 'u', text)
    text = re.sub(r'ç', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def extract_links(text):
    github = None
    linkedin = None
    if 'github.com' in text.lower():
        match = re.search(r'(https?://[^\s]*github\.com[^\s]*)', text)
        if match: github = match.group(1)
    if 'linkedin.com' in text.lower():
        match = re.search(r'(https?://[^\s]*linkedin\.com[^\s]*)', text)
        if match: linkedin = match.group(1)
    return github, linkedin

def extract_drive_id(url):
    # Extrai o ID do Google Drive para poder usar como link direto de imagem
    match = re.search(r'id=([a-zA-Z0-9_-]+)', url)
    if match: return match.group(1)
    match = re.search(r'd/([a-zA-Z0-9_-]+)', url)
    if match: return match.group(1)
    return None

def fetch_with_retry(url, max_retries=5, backoff=3):
    """Faz download com User-Agent de browser e retry com backoff exponencial."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    }
    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.read().decode('utf-8')
        except Exception as e:
            wait = backoff * (2 ** (attempt - 1))
            print(f"  ⚠️  Tentativa {attempt}/{max_retries} falhou: {e}")
            if attempt < max_retries:
                print(f"     Aguardando {wait}s antes de tentar novamente...")
                time.sleep(wait)
            else:
                raise RuntimeError(
                    f"Falha ao baixar dados após {max_retries} tentativas: {e}"
                ) from e

def main():
    print("Baixando dados do Google Sheets...")
    content = fetch_with_retry(CSV_URL)
    
    reader = csv.DictReader(StringIO(content))
    talentos = []
    
    for row in reader:
        nome = row.get('Nome Completo', '').strip()
        if not nome:
            continue
            
        curso = row.get('Curso/Habilitação (Inclua Ensino Médio, Técnico ou Superior)', '').strip()
        semestre = row.get('Período/Semestre Atual (Ex: 3º Semestre, 5º Módulo)', '').strip()
        
        areas = row.get('Áreas de Interesse para Estágio (Selecione as que se aplicam)', '')
        areas_list = [a.strip() for a in areas.split(',') if a.strip()]
        superpoder = areas_list[0] if areas_list else 'Multidisciplinar'
        if len(superpoder) > 40:
            superpoder = superpoder[:37] + '...'
            
        bio_raw = row.get('Descreva suas principais habilidades técnicas (hard skills) e interpessoais (soft skills).', '').strip()
        bio = bio_raw[:147] + '...' if len(bio_raw) > 150 else bio_raw
        if not bio:
            bio = "Buscando novas oportunidades e aprendizados."
            
        skills = areas_list[:4]
        
        links_text = row.get('Link para Portfólio ou Perfil Profissional (Ex: GitHub, LinkedIn, Behance - Opcional)', '')
        github, linkedin = extract_links(links_text)
        
        # Novos campos requeridos pelo usuário
        turno = row.get('Turno de Estudo', '').strip()
        disponibilidade = row.get('Disponibilidade para Estágio', '').strip()
        
        idiomas = []
        ing = row.get('Nível de Proficiência em Idiomas Estrangeiros (Opcional) [Inglês]', '').strip()
        esp = row.get('Nível de Proficiência em Idiomas Estrangeiros (Opcional) [Espanhol]', '').strip()
        out = row.get('Nível de Proficiência em Idiomas Estrangeiros (Opcional) [Outro]', '').strip()
        if ing: idiomas.append(f"Inglês: {ing}")
        if esp: idiomas.append(f"Espanhol: {esp}")
        if out: idiomas.append(f"Outro: {out}")
        
        experiencia = row.get('Possui experiência anterior em estágio, monitoria ou trabalho na área?', '').strip()
        curriculo = row.get('Link para seu Currículo Vitae (Ex: PDF no Google Drive, OneDrive ou similar - Certifique-se de que o link está configurado para acesso público/compartilhável)', '').strip()
        
        # Foto do Google Drive (conversão para direct link)
        foto_url = row.get('Foto para o card de apresentação', '').strip()
        foto_direta = None
        if foto_url:
            drive_id = extract_drive_id(foto_url)
            if drive_id:
                # O endpoint lh3.googleusercontent.com/d/ preserva os metadados EXIF (orientação da foto) 
                # e funciona diretamente agora que a pasta é pública.
                foto_direta = f"https://lh3.googleusercontent.com/d/{drive_id}"
                
        avatar_seed = slugify(nome)
        email = row.get('Endereço de e-mail', '')
        id_hash = hashlib.md5((email + nome).encode()).hexdigest()[:8]
        
        consentimento = row.get('Termo de Consentimento: Autorizo o IFCE Campus Maracanaú a utilizar e compartilhar as informações fornecidas neste formulário com empresas parceiras interessadas em contratar estagiários.', '')
        
        autorizado = 'Sim' in consentimento or consentimento.strip() == ''
        
        talentos.append({
            "id": id_hash,
            "nome": nome,
            "curso": curso,
            "semestre": semestre,
            "superpoder": superpoder,
            "bio": bio,
            "skills": skills,
            "github": github,
            "linkedin": linkedin,
            "avatar_seed": avatar_seed,
            "foto": foto_direta,
            "turno": turno,
            "disponibilidade": disponibilidade,
            "idiomas": idiomas,
            "experiencia": experiencia,
            "curriculo": curriculo,
            "autorizado": autorizado
        })
            
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(talentos, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Arquivo gerado com sucesso em: {OUTPUT_FILE}")
    print(f"Total de talentos processados: {len(talentos)}")

if __name__ == '__main__':
    main()
