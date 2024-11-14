insert into universidades (id,nombre) values (1,'PUCV');
insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('INF3340','Redes',1),
('ING9003','Ingles 3',1),
('CS101','Calculo',1);

insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('MAT2178','Calculo Integral',1),
('ICA2160','Economia',1),
('INF2341','Sistemas Operativos',1),
('INF3140','Finanzas',1);

insert into asignaturas (codigo,nombreasignatura,id_universidad) values
('MAT1166','Fundamentos De Calculo',1),
('MAT1169','Fundamentos De Algebra Lineal',1);

-- USUARIOS INICIALES DE PRUEBA (ADMINISTRADOR)
INSERT INTO usuarios (id, nombre, correo, contrasenia,fechanacimiento,genero,telefono,descripcion,id_universidad) VALUES 
('2ca36644','ADMIN SWIFTY','swifty.info.cl@gmail.com','$2b$10$NLBoSEJwvZYBunsgL25Z9eB5e8YEQass4sGIx9YChjOkVF7r23nuS','','No especificado','No especificado','',1);
INSERT INTO estudiantes (id) VALUES('2ca36644');
UPDATE usuarios SET id_estudiante = '2ca36644' WHERE correo = 'swifty.info.cl@gmail.com';
INSERT INTO administradores (id) VALUES('2ca36644');
UPDATE usuarios SET id_administrador = '2ca36644' WHERE correo = 'swifty.info.cl@gmail.com';

--TUTORES
INSERT INTO usuarios (id, nombre, correo, contrasenia,fechanacimiento,genero,telefono,descripcion,id_universidad) VALUES 
('8f067e4e','tutor','tutor@gmail.com','$2b$10$UTKPUozlZBU0.ebt1wQ9y..3qvNEp4PzuEDuJOVxQ6Q6R3H1bL.pu','','No especificado','No especificado','',1);

INSERT INTO estudiantes (id) VALUES('8f067e4e');
UPDATE usuarios SET id_estudiante = '8f067e4e' WHERE correo = 'tutor@gmail.com';
INSERT INTO tutores (id) VALUES('8f067e4e');
UPDATE usuarios SET id_tutor = '8f067e4e' WHERE correo = 'tutor@gmail.com';

INSERT INTO imparten(codigo_asignatura, id_universidad, id_tutor, precio,nombre_asignatura)
VALUES ('INF3340', 1, '8f067e4e', 5000,'Redes');
INSERT INTO imparten(codigo_asignatura, id_universidad, id_tutor, precio,nombre_asignatura)
VALUES ('ING9003', 1, '8f067e4e', 10000,'Ingles 3');
--ESTUDIANTE
INSERT INTO usuarios (id, nombre, correo, contrasenia,fechanacimiento,genero,telefono,descripcion,id_universidad) VALUES 
('b362239e','estudiante','estudiante@gmail.com','$2b$10$igHIicqoBbaQwThtCzoWFuYHjPkyHbEOPr.XXdVPpmw1jJIm4rMmq','','No especificado','No especificado','',1);

INSERT INTO estudiantes (id) VALUES('b362239e');
UPDATE usuarios SET id_estudiante = 'b362239e' WHERE correo = 'estudiante@gmail.com';