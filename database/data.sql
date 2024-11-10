insert into universidades (id,nombre) values (1,'PUCV')

insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('INF3340','Redes',1),
('ING9003','Ingles 3',1),
('CS101','Calculo',1),

insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('MAT2178','Calculo Integral',1),
('ICA2160','Economia',1),
('INF2341','Sistemas Operativos',1),
('INF3140','Finanzas',1)

insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('MAT1166','Fundamentos De Calculo',1),
('MAT1169','Fundamentos De Algebra Lineal',1)



insert into administradores(id) values('id');
update usuarios
set id_administrador = 'id'
where correo ='swifty.info.cl@gmail.com';