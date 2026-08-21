import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-post-graduation',
  templateUrl: './post-graduation.component.html',
  styleUrls: ['./post-graduation.component.scss'],
})
export class PostGraduationComponent implements OnInit {
  cards = [
    {
      title: 'Pós-Graduação',
      description: 'Cursos',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/cursos-de-pos-graduacao/',
    },
    {
      title: 'Processos Seletivos',
      description: 'Da Pós-Graduação',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/processos-seletivos/',
    },
    {
      title: 'Departamento de Pós-Graduação',
      description: 'Atribuições',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/departamento-de-pos-graduacao/',
    },
    {
      title: 'Capacitação',
      description: 'De Servidores',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/capacitacao-de-servidores/',
    },
    {
      title: 'Legislação e Documentação',
      description: 'Da Pós-Graduação',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/legislacao/',
    },
    {
      title: 'Formulários',
      description: 'E Modelos',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/formularios-e-modelos/',
    },
    {
      title: 'Sistemas',
      description: 'Links',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/sistemas/',
    },
    {
      title: 'Equipe',
      description: 'Da Pós-Graduação',
      link: 'https://portal.ifce.edu.br/institucional/pesquisa-pos-graduacao-e-inovacao/pos-graduacao/equipe/',
    },
  ];

  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Pós-Graduação | DEPPI IFCE');
  }
}
