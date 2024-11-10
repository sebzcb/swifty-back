insert into universidades (id,nombre) values (1,'PUCV')

insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('INF3340','Redes',1),
('ING9003','Ingles 3',1),
('CS101','Calculo',1)

insert into administradores(id) values('1d5702c7');
update usuarios
set id_administrador = '1d5702c7'
where correo ='test@gmail.com';