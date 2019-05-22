-- Insert usuario
insert into usuario (login_usuario, email_usuario, senha_usuario, deleted_usario, local_usuario, bio_usuario)
values ('admin', 'admin@gmail.com', '1234', 0, 'São Paulo', 'sei lá');
insert into usuario (login_usuario, email_usuario, senha_usuario, deleted_usario, local_usuario, bio_usuario)
values ('Sergio123', 'sergio@gmail.com', '123sergio', 0, 'São Paulo', 'eu sou sergio');

-- Insert pergunta
INSERT INTO pergunta (titulo_pergunta,dt_pergunta,nick_pergunta,desc_pergunta,id_usuario) 
values ("Como fazer get e post em Node?",curdate(),"get/post Node", "Estou com dúvida sobre como fazer get e post em Node", 1),
("Como fazer tabela com HTML",curdate(),"Tabela HTML","Gostaria de saber como fazer uma tabela em HTML",1),
("Stackoverflow no Java",curdate(),"Stackoverflow", "O que é stackoverflow?", 1),
("Como fazer circulo no CSS",curdate(),"Circulo CSS", "Queria saber como fazer um circulo com Css", 2),
("Problemas com EJS",curdate(),"Problema EJS", "Não sei como implementar o EJS em meu projeto :(", 2);

select * from pergunta;
select titulo_pergunta as title, dt_pergunta as date, nick_pergunta as nick, desc_pergunta as description, usuario.login_usuario as user , pergunta.id_pergunta as id 
from pergunta 
inner join usuario on ( usuario.id_usuario = pergunta.id_usuario);