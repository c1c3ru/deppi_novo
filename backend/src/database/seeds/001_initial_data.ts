import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function seed(knex: Knex): Promise<void> {
  // Limpar dados existentes
  await knex('news').del();
  await knex('boletins').del();
  await knex('sessions').del();
  await knex('uploads').del();
  await knex('users').del();

  const dummyPasswordHash = await bcrypt.hash('LOCKED_' + Math.random(), 12);

  const allowedUsers = [
  {
    "registration": "2329311",
    "name": "Adriana Goncalves de Sales Costa",
    "email": "adriana.sales@ifce.edu.br"
  },
  {
    "registration": "1570732",
    "name": "Adriana Marques Rocha",
    "email": "adrianamr@ifce.edu.br"
  },
  {
    "registration": "1236014",
    "name": "Adriano Barros Carneiro",
    "email": "adriano.carneiro@ifce.edu.br"
  },
  {
    "registration": "1556624",
    "name": "Adriano Holanda Pereira",
    "email": "holanda@ifce.edu.br"
  },
  {
    "registration": "1958500",
    "name": "Adriano Tavares de Freitas",
    "email": "adriano.freitas@ifce.edu.br"
  },
  {
    "registration": "1652416",
    "name": "Agebson Rocha Facanha",
    "email": "agebson@ifce.edu.br"
  },
  {
    "registration": "1679143",
    "name": "Agnes Caroline Souza Pinto",
    "email": "carolcedro@ifce.edu.br"
  },
  {
    "registration": "3505114",
    "name": "Alanio Ferreira de Lima",
    "email": "alanio.ferreira@ifce.edu.br"
  },
  {
    "registration": "2283496",
    "name": "Alex Lima Almeida",
    "email": "alex.lima@ifce.edu.br"
  },
  {
    "registration": "2418058",
    "name": "Alrivane Fernandes de Sousa",
    "email": "alrivane.sousa@ifce.edu.br"
  },
  {
    "registration": "1856744",
    "name": "Amauri Holanda de Souza Junior",
    "email": "amauriholanda@ifce.edu.br"
  },
  {
    "registration": "1552994",
    "name": "Ana Carla Cadarco Costa",
    "email": "carla@ifce.edu.br"
  },
  {
    "registration": "1522567",
    "name": "Ana Cristina Fernandes Muniz Vidal",
    "email": "cristinamuniz@ifce.edu.br"
  },
  {
    "registration": "1757600",
    "name": "Ana Cristina de Alencar Rodrigues",
    "email": "cristina.rodrigues@ifce.edu.br"
  },
  {
    "registration": "1666817",
    "name": "Ana Karine Pessoa Bastos",
    "email": "karinebastos@ifce.edu.br"
  },
  {
    "registration": "1779128",
    "name": "Ana Shirley Monteiro da Silva",
    "email": "shirley.monteiro@ifce.edu.br"
  },
  {
    "registration": "1674404",
    "name": "Anderson de Castro Lima",
    "email": "anderson@ifce.edu.br"
  },
  {
    "registration": "1890898",
    "name": "Andreia Cavalcante Rodrigues",
    "email": "andreiacavalcante@ifce.edu.br"
  },
  {
    "registration": "1043432",
    "name": "Antonia Ney Pereira Siqueira",
    "email": "ney.pereira@ifce.edu.br"
  },
  {
    "registration": "2031223",
    "name": "Antonio Barbosa de Souza Junior",
    "email": "antonio.barbosa@ifce.edu.br"
  },
  {
    "registration": "1676089",
    "name": "Antonio Carlos de Souza",
    "email": "carlosfisica@ifce.edu.br"
  },
  {
    "registration": "1811881",
    "name": "Antonio Edson Oliveira Marques",
    "email": "edmarque@ifce.edu.br"
  },
  {
    "registration": "3071234",
    "name": "Antonio de Padua Teixeira Filho",
    "email": "padua.antonio@ifce.edu.br"
  },
  {
    "registration": "1812483",
    "name": "Aurenivia Ferreira da Silva",
    "email": "aurenivia@ifce.edu.br"
  },
  {
    "registration": "1841491",
    "name": "Barbara Suellen Ferreira Rodrigues",
    "email": "barbarasuellen@ifce.edu.br"
  },
  {
    "registration": "1089001",
    "name": "Bruno Alves de Mesquita",
    "email": "bruno.mesquita@ifce.edu.br"
  },
  {
    "registration": "1666904",
    "name": "Bruno Cesar Barroso Salgado",
    "email": "brunocesar@ifce.edu.br"
  },
  {
    "registration": "2273634",
    "name": "Bruno Correia da Silva",
    "email": "bruno.silva@ifce.edu.br"
  },
  {
    "registration": "1966127",
    "name": "Carlos Henrique Leitao Cavalcante",
    "email": "henriqueleitao@ifce.edu.br"
  },
  {
    "registration": "1290570",
    "name": "Carlos Henrique Lima",
    "email": "cshlima@ifce.edu.br"
  },
  {
    "registration": "1666808",
    "name": "Carlos Ronald Pessoa Wanderley",
    "email": "ronald@ifce.edu.br"
  },
  {
    "registration": "3420744",
    "name": "Carlos da Silva Brito",
    "email": "carlos.brito@ifce.edu.br"
  },
  {
    "registration": "1756407",
    "name": "Caroline de Goes Sampaio",
    "email": "carolinesampaio@ifce.edu.br"
  },
  {
    "registration": "2134798",
    "name": "Cicero Erialdo Oliveira Lima",
    "email": "cicero.erialdo@ifce.edu.br"
  },
  {
    "registration": "2231232",
    "name": "Cicero Jose Sousa da Silva",
    "email": "cicero.silva@ifce.edu.br"
  },
  {
    "registration": "1641764",
    "name": "Corneli Gomes Furtado Junior",
    "email": "cjunior@ifce.edu.br"
  },
  {
    "registration": "2164879",
    "name": "Cristiane Gonzaga Oliveira",
    "email": "cristiane.oliveira@ifce.edu.br"
  },
  {
    "registration": "1954873",
    "name": "Cristiano do Nascimento Lira",
    "email": "cristiano.lira@ifce.edu.br"
  },
  {
    "registration": "1674316",
    "name": "Cynara Reis Aguiar",
    "email": "cynara@ifce.edu.br"
  },
  {
    "registration": "1856850",
    "name": "Daniel Alencar Barros Tavares",
    "email": "daniel.alencar@ifce.edu.br"
  },
  {
    "registration": "1960021",
    "name": "Daniel Barbosa de Brito",
    "email": "daniel.brito@ifce.edu.br"
  },
  {
    "registration": "1720399",
    "name": "Daniel Regis de Franca Cirino",
    "email": "daniel.regis@ifce.edu.br"
  },
  {
    "registration": "1795291",
    "name": "Daniel Silva Ferreira",
    "email": "daniels@ifce.edu.br"
  },
  {
    "registration": "2274672",
    "name": "David Aurelio Lima Silveira",
    "email": "david.aurelio@ifce.edu.br"
  },
  {
    "registration": "1545800",
    "name": "David Carneiro de Souza",
    "email": "davidcs@ifce.edu.br"
  },
  {
    "registration": "1954453",
    "name": "Diego Bastos do Nascimento Martins",
    "email": "diego.bastos@ifce.edu.br"
  },
  {
    "registration": "2076118",
    "name": "Diego Ponciano de Oliveira Lima",
    "email": "diego.ponciano@ifce.edu.br"
  },
  {
    "registration": "1818968",
    "name": "Elder Kened Cardoso",
    "email": "elder.cardoso@ifce.edu.br"
  },
  {
    "registration": "1856809",
    "name": "Elder dos Santos Teixeira",
    "email": "elderteixeira@ifce.edu.br"
  },
  {
    "registration": "2239943",
    "name": "Emerson Henrique Oliveira de Araujo",
    "email": "emerson.henrique@ifce.edu.br"
  },
  {
    "registration": "1316796",
    "name": "Emilia Maria Alves Santos",
    "email": "emilia@ifce.edu.br"
  },
  {
    "registration": "1838642",
    "name": "Emmanuel Jordan Gadelha Moreira",
    "email": "emmanueljordan@ifce.edu.br"
  },
  {
    "registration": "3446622",
    "name": "Emmanuelle Maria Vasconcelos Matos",
    "email": "emmanuelle.matos@ifce.edu.br"
  },
  {
    "registration": "3497722",
    "name": "Enilce Lima Cavalcante de Souza",
    "email": "enilce@ifce.edu.br"
  },
  {
    "registration": "1857765",
    "name": "Erika da Justa Teixeira Rocha",
    "email": "erikadajusta@ifce.edu.br"
  },
  {
    "registration": "1453960",
    "name": "Eugenio Barreto Sousa e Silva",
    "email": "eugenio@ifce.edu.br"
  },
  {
    "registration": "2949424",
    "name": "Euripedes Carvalho da Silva",
    "email": "euripedes.carvalho@ifce.edu.br"
  },
  {
    "registration": "2279588",
    "name": "Eurivan Alves Meneses",
    "email": "eurivan.meneses@ifce.edu.br"
  },
  {
    "registration": "1322802",
    "name": "Fabiana Gomes Marinho",
    "email": "fabiana.gomes@ifce.edu.br"
  },
  {
    "registration": "2171750",
    "name": "Fabio Jose Gomes de Sousa",
    "email": "fabio.jose@ifce.edu.br"
  },
  {
    "registration": "1641803",
    "name": "Fabio Timbo Brito",
    "email": "fabio@ifce.edu.br"
  },
  {
    "registration": "2187585",
    "name": "Fabiola Oliveira Xavier da Silva",
    "email": "fabiola.xavier@ifce.edu.br"
  },
  {
    "registration": "4619376",
    "name": "Fabricio Bandeira da Silva",
    "email": "fabricio@ifce.edu.br"
  },
  {
    "registration": "2418335",
    "name": "Francisca Antonia Jucileyde dos Reis Brandao",
    "email": "jucileyde.reis@ifce.edu.br"
  },
  {
    "registration": "2262767",
    "name": "Francisca Antonia Marcilane Goncalves Cruz",
    "email": "marcilane.cruz@ifce.edu.br"
  },
  {
    "registration": "1683102",
    "name": "Francisca Danielli do Vale Almeida",
    "email": "danielli.vale@ifce.edu.br"
  },
  {
    "registration": "1460033",
    "name": "Francisca Ione Chaves",
    "email": "ione@ifce.edu.br"
  },
  {
    "registration": "2862250",
    "name": "Francisca Karen Souza da Silva Farias",
    "email": "karen.farias@ifce.edu.br"
  },
  {
    "registration": "2165950",
    "name": "Francisco Edson Gama Coutinho",
    "email": "edson.coutinho@ifce.edu.br"
  },
  {
    "registration": "2811965",
    "name": "Francisco Edson Mesquita Farias",
    "email": "edson.mesquita@ifce.edu.br"
  },
  {
    "registration": "1666797",
    "name": "Francisco Frederico dos Santos Matos",
    "email": "fred.matos@ifce.edu.br"
  },
  {
    "registration": "1666898",
    "name": "Francisco Humberto de Carvalho Junior",
    "email": "humbertojr@ifce.edu.br"
  },
  {
    "registration": "2163663",
    "name": "Francisco Ivan de Oliveira",
    "email": "ivan.oliveira@ifce.edu.br"
  },
  {
    "registration": "2635531",
    "name": "Francisco Jose dos Santos Oliveira",
    "email": "fjoliveira@ifce.edu.br"
  },
  {
    "registration": "1168582",
    "name": "Francisco Jucivanio Felix de Sousa",
    "email": "jucivanio.felix@ifce.edu.br"
  },
  {
    "registration": "2328209",
    "name": "Francisco Marcio Santos da Silva",
    "email": "marcio.santos@ifce.edu.br"
  },
  {
    "registration": "2136839",
    "name": "Francisco Rafael Sousa Freitas",
    "email": "rafael.freitas@ifce.edu.br"
  },
  {
    "registration": "1616139",
    "name": "Francisco Ricardo Nogueira de Vasconcelos",
    "email": "vasconcelos.ricardo@ifce.edu.br"
  },
  {
    "registration": "293213",
    "name": "Francisco de Assis Francelino Alves",
    "email": "francisco.francelino@ifce.edu.br"
  },
  {
    "registration": "1667576",
    "name": "Franklin Aragao Gondim",
    "email": "aragaofg@ifce.edu.br"
  },
  {
    "registration": "2134999",
    "name": "Genilson Gomes da Silva",
    "email": "genilson.silva@ifce.edu.br"
  },
  {
    "registration": "1237434",
    "name": "Geny Gil Sa",
    "email": "geny.gil@ifce.edu.br"
  },
  {
    "registration": "1352895",
    "name": "Germana Maria Marinho Silva",
    "email": "germana@ifce.edu.br"
  },
  {
    "registration": "1675632",
    "name": "Glaucio Barreto de Lima",
    "email": "glauciobarreto@ifce.edu.br"
  },
  {
    "registration": "1795390",
    "name": "Grazianne Sousa Rodrigues da Costa",
    "email": "grazianne@ifce.edu.br"
  },
  {
    "registration": "1168313",
    "name": "Guilherme da Silva Braga",
    "email": "guilherme.braga@ifce.edu.br"
  },
  {
    "registration": "1958415",
    "name": "Heloisa Beatriz Cordeiro Moreira",
    "email": "heloisa.beatriz@ifce.edu.br"
  },
  {
    "registration": "1795290",
    "name": "Igor Rafael Silva Valente",
    "email": "igor@ifce.edu.br"
  },
  {
    "registration": "1622296",
    "name": "Inacio Cordeiro Alves",
    "email": "inacioalves@ifce.edu.br"
  },
  {
    "registration": "3431879",
    "name": "Isabely do Nascimento Costa",
    "email": "isabely.costa@ifce.edu.br"
  },
  {
    "registration": "1825387",
    "name": "Italo Lima dos Santos",
    "email": "italo.santos@ifce.edu.br"
  },
  {
    "registration": "2280853",
    "name": "Ivelma Maria Bezerra Lima",
    "email": "ivelma.lima@ifce.edu.br"
  },
  {
    "registration": "1993248",
    "name": "Jackson Henrique Braga da Silva",
    "email": "jackson.silva@ifce.edu.br"
  },
  {
    "registration": "1381194",
    "name": "Jean Carlo Vidal dos Santos",
    "email": "jean.carlo@ifce.edu.br"
  },
  {
    "registration": "2075673",
    "name": "Jean Jefferson Moraes da Silva",
    "email": "jean.silva@ifce.edu.br"
  },
  {
    "registration": "1674463",
    "name": "Jean Marcelo da Silva Maciel",
    "email": "jeanmdsm@ifce.edu.br"
  },
  {
    "registration": "1532845",
    "name": "Joao Carlos da Costa Assuncao",
    "email": "joaocarlos@ifce.edu.br"
  },
  {
    "registration": "1958541",
    "name": "Joao Claudio Nunes Carvalho",
    "email": "joao.carvalho@ifce.edu.br"
  },
  {
    "registration": "1276550",
    "name": "Joao Herminio da Rosa Goncalves",
    "email": "herminio@ifce.edu.br"
  },
  {
    "registration": "2166552",
    "name": "Joao Victor Maximiano Albuquerque",
    "email": "victor.maximiano@ifce.edu.br"
  },
  {
    "registration": "1075472",
    "name": "Jonatha Rodrigues da Costa",
    "email": "jonatha.costa@ifce.edu.br"
  },
  {
    "registration": "2706748",
    "name": "Jose Ciro dos Santos",
    "email": "ciro@ifce.edu.br"
  },
  {
    "registration": "1442729",
    "name": "Jose Daniel de Alencar Santos",
    "email": "jdaniel@ifce.edu.br"
  },
  {
    "registration": "1955099",
    "name": "Jose Elieudo Nascimento de Sousa",
    "email": "jose.elieudo@ifce.edu.br"
  },
  {
    "registration": "2255839",
    "name": "Jose Evandro dos Santos",
    "email": "evandro.santos@ifce.edu.br"
  },
  {
    "registration": "1892346",
    "name": "Jose Nilton Alves Pereira Junior",
    "email": "junior.alves@ifce.edu.br"
  },
  {
    "registration": "1958481",
    "name": "Juliana de Brito Marques do Nascimento",
    "email": "juliana.brito@ifce.edu.br"
  },
  {
    "registration": "2229734",
    "name": "Julio Mario Pinheiro Cordeiro Nascimento",
    "email": "julio.mario@ifce.edu.br"
  },
  {
    "registration": "1958161",
    "name": "Karyna Oliveira Chaves de Lucena",
    "email": "karina.oliveira@ifce.edu.br"
  },
  {
    "registration": "1795230",
    "name": "Keyla de Souza Lima Cruz",
    "email": "keylalima@ifce.edu.br"
  },
  {
    "registration": "2165051",
    "name": "Leilane Lima Almeida Evangelista",
    "email": "leilane.evangelista@ifce.edu.br"
  },
  {
    "registration": "2279734",
    "name": "Lineusa Maria Carneiro de Oliveira Cruz",
    "email": "lineusa.maria@ifce.edu.br"
  },
  {
    "registration": "1978162",
    "name": "Lucelia Fernandes de Almeida Lima",
    "email": "lucelia.fernandes@ifce.edu.br"
  },
  {
    "registration": "1330270",
    "name": "Luciana de Oliveira Souza Mendonca",
    "email": "lucianamendonca@ifce.edu.br"
  },
  {
    "registration": "1794399",
    "name": "Luis Jose Silveira de Sousa",
    "email": "luisjose@ifce.edu.br"
  },
  {
    "registration": "1675435",
    "name": "Luiz Carlos Silveira de Sousa",
    "email": "luizcarlosss@ifce.edu.br"
  },
  {
    "registration": "1842966",
    "name": "Luiz Daniel Santos Bezerra",
    "email": "danielbezerra@ifce.edu.br"
  },
  {
    "registration": "1794127",
    "name": "Maira Nobre de Castro",
    "email": "mairanobre@ifce.edu.br"
  },
  {
    "registration": "1990820",
    "name": "Manuel Ricardo dos Santos Rabelo",
    "email": "manuel.rabelo@ifce.edu.br"
  },
  {
    "registration": "1586384",
    "name": "Marceu Verissimo Ramos dos Santos",
    "email": "marceuverissimo@ifce.edu.br"
  },
  {
    "registration": "1795380",
    "name": "Marcos Cirineu Aguiar Siqueira",
    "email": "marcoscirineu@ifce.edu.br"
  },
  {
    "registration": "1341657",
    "name": "Maria Helena Clarindo Gabriel",
    "email": "helena.gabriel@ifce.edu.br"
  },
  {
    "registration": "1757146",
    "name": "Maria do Socorro Cardoso de Abreu",
    "email": "mariadosocorro@ifce.edu.br"
  },
  {
    "registration": "1474354",
    "name": "Maria do Socorro Pinheiro da Silva",
    "email": "socorro.pinheiro@ifce.edu.br"
  },
  {
    "registration": "1668737",
    "name": "Maria do Socorro Ribeiro Hortegal Filha",
    "email": "socorrohortegal@ifce.edu.br"
  },
  {
    "registration": "2408342",
    "name": "Mariana Baraldi Silva Silvino",
    "email": "mariana.silvino@ifce.edu.br"
  },
  {
    "registration": "1758962",
    "name": "Mariana Bezerra Macedo",
    "email": "mariana.macedo@ifce.edu.br"
  },
  {
    "registration": "1842469",
    "name": "Mayhara Martins Cordeiro Barbosa",
    "email": "mayhara@ifce.edu.br"
  },
  {
    "registration": "2418385",
    "name": "Narcelio Jose Pires Ribeiro Junior",
    "email": "narcelio.jose@ifce.edu.br"
  },
  {
    "registration": "1980463",
    "name": "Natalia Parente de Lima Valente",
    "email": "natalia.parente@ifce.edu.br"
  },
  {
    "registration": "1612866",
    "name": "Otavio Alcantara de Lima Junior",
    "email": "otavio@ifce.edu.br"
  },
  {
    "registration": "2188862",
    "name": "Rafael Oliveira de Sousa",
    "email": "rafael.sousa@ifce.edu.br"
  },
  {
    "registration": "1057215",
    "name": "Rafaely Alcantara da Silva",
    "email": "rafaelyalcantara@ifce.edu.br"
  },
  {
    "registration": "3095244",
    "name": "Raimundo Quelpes Ferreira da Silva",
    "email": "quelpes.silva@ifce.edu.br"
  },
  {
    "registration": "1957778",
    "name": "Renata Alves Albuquerque",
    "email": "renata.alves@ifce.edu.br"
  },
  {
    "registration": "269968",
    "name": "Roberto Albuquerque Pontes Filho",
    "email": "roberto@ifce.edu.br"
  },
  {
    "registration": "2809160",
    "name": "Rosangela Campos dos Anjos",
    "email": "rosangela.anjos@ifce.edu.br"
  },
  {
    "registration": "1473367",
    "name": "Rossana Barros Silveira",
    "email": "rossana@ifce.edu.br"
  },
  {
    "registration": "1290982",
    "name": "Sameque do Nascimento Oliveira",
    "email": "sameque.oliveira@ifce.edu.br"
  },
  {
    "registration": "2230918",
    "name": "Samoel Rodrigues da Silva",
    "email": "samoel.rodrigues@ifce.edu.br"
  },
  {
    "registration": "2124512",
    "name": "Sarah Maria Borges Carneiro",
    "email": "sarah.borges@ifce.edu.br"
  },
  {
    "registration": "1891121",
    "name": "Saulo Rego da Silva",
    "email": "saulo.silva@ifce.edu.br"
  },
  {
    "registration": "2229884",
    "name": "Sena Moreira do Nascimento",
    "email": "sena.moreira@ifce.edu.br"
  },
  {
    "registration": "1887567",
    "name": "Shirliane da Silva Aguiar",
    "email": "shirliane.aguiar@ifce.edu.br"
  },
  {
    "registration": "2279490",
    "name": "Stenisia Denis Holanda Lavor Gurgel",
    "email": "stenisia.lavor@ifce.edu.br"
  },
  {
    "registration": "1544559",
    "name": "Teofilo Roberto da Silva",
    "email": "teofilo.silva@ifce.edu.br"
  },
  {
    "registration": "2230726",
    "name": "Teresinha de Fatima Severiano Cruz",
    "email": "terezinha.cruz@ifce.edu.br"
  },
  {
    "registration": "1886204",
    "name": "Thiago Alves Rocha",
    "email": "thiago.alves@ifce.edu.br"
  },
  {
    "registration": "1981232",
    "name": "Thiago Queiroz de Oliveira",
    "email": "thiago.queiroz@ifce.edu.br"
  },
  {
    "registration": "1981108",
    "name": "Thomas de Oliveira Praxedes",
    "email": "thomas.praxedes@ifce.edu.br"
  },
  {
    "registration": "1958085",
    "name": "Tiago Gadelha de Sousa",
    "email": "tiago.gadelha@ifce.edu.br"
  },
  {
    "registration": "1544405",
    "name": "Venceslau Xavier de Lima Filho",
    "email": "venceslau@ifce.edu.br"
  },
  {
    "registration": "1659388",
    "name": "Venicio Soares de Oliveira",
    "email": "veniciosoares@ifce.edu.br"
  },
  {
    "registration": "1958223",
    "name": "Victor Hugo Pereira Soares de Joinville Moura",
    "email": "victor.moura@ifce.edu.br"
  },
  {
    "registration": "2274041",
    "name": "Weber Chaves Fontoura",
    "email": "weber.fontoura@ifce.edu.br"
  },
  {
    "registration": "1548006",
    "name": "Wellington Araujo Albano",
    "email": "wellington@ifce.edu.br"
  }
];

  // Inserir usuários da lista
  const usersToInsert = allowedUsers.map(u => ({
    registration: u.registration,
    name: u.name,
    email: u.email,
    password_hash: dummyPasswordHash,
    roles: JSON.stringify(['user', 'admin']), // All allowed to edit bulletins
    is_active: true,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));

  // Adicionar um admin mestre para testes se não estiver na lista.
  // Senha gerada aleatoriamente a cada seed (nunca hardcoded) e impressa
  // uma única vez no log — precisa ser capturada agora e trocada no
  // primeiro login, pois não fica salva em nenhum outro lugar.
  if (!usersToInsert.find(u => u.registration === '123456')) {
    const adminRawPassword = crypto.randomBytes(6).toString('hex');
    const adminPasswordHash = await bcrypt.hash(adminRawPassword, 12);
    usersToInsert.push({
      registration: '123456',
      name: 'Administrador Sistema',
      email: 'deppi.maracanau@ifce.edu.br',
      password_hash: adminPasswordHash,
      roles: JSON.stringify(['user', 'admin']),
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });
    console.log('\n============================================================');
    console.log('  Conta admin mestre criada — matrícula 123456');
    console.log(`  Senha temporária: ${adminRawPassword}`);
    console.log('  Guarde-a agora: não será exibida de novo. Troque-a após o');
    console.log('  primeiro login.');
    console.log('============================================================\n');
  }

  // Insert in chunks to avoid literal overflow
  const chunkSize = 50;
  for (let i = 0; i < usersToInsert.length; i += chunkSize) {
    await knex('users').insert(usersToInsert.slice(i, i + chunkSize));
  }

  const firstUser = await knex('users').first();
  const userId = firstUser.id;

  // Inserir boletim de exemplo
  await knex('boletins').insert({
    title: 'Boletim DEPPI - Início de Ano 2026',
    description: 'Relatório das atividades iniciais do Departamento de Pesquisa e Inovação',
    content: '<h1>Bem-vindo ao Portal de Boletins</h1><p>Este é o primeiro boletim de 2026.</p>',
    publication_date: '2026-01-30',
    status: 'published',
    created_by: userId,
    is_featured: true,
    view_count: 0,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  });

  console.log('✅ Seeds executados com sucesso!');
  console.log(`   ${usersToInsert.length} usuários inseridos na base de dados.`);
}
