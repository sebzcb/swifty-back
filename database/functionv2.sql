-- FUNCTION: public.obtener_promedio_calificacion(character varying, boolean, double precision)

-- DROP FUNCTION IF EXISTS public.obtener_promedio_calificacion(character varying, boolean, double precision);

CREATE OR REPLACE FUNCTION public.obtener_promedio_calificacion(
	p_id_tutor character varying,
	aproximar boolean,
	intervalo double precision)
    RETURNS double precision
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    promedio_calificacion FLOAT;
BEGIN
    SELECT AVG(calificacion) INTO promedio_calificacion
    FROM comentarios
    WHERE id_tutor = p_id_tutor;

    IF aproximar THEN
        promedio_calificacion := ROUND(promedio_calificacion / intervalo) * intervalo;
    END IF;

    RETURN promedio_calificacion;
END; 
$BODY$;

ALTER FUNCTION public.obtener_promedio_calificacion(character varying, boolean, double precision)
    OWNER TO postgres;


-- FUNCTION: public.obtener_promedio_calificacion(character varying)

-- DROP FUNCTION IF EXISTS public.obtener_promedio_calificacion(character varying);

CREATE OR REPLACE FUNCTION public.obtener_promedio_calificacion(
	p_id_tutor character varying)
    RETURNS double precision
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN
    RETURN obtener_promedio_calificacion(p_id_tutor, false, 0.5);
END; 
$BODY$;

ALTER FUNCTION public.obtener_promedio_calificacion(character varying)
    OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_tutorias_impartidas(
    tutor_id character varying)
    RETURNS TABLE(asignaturas_impartidas character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY 
    SELECT 
        CAST(string_agg(a.nombreasignatura || ' - $' || tu.precio::text || ' CLP', ', ') AS character varying) AS asignaturas_impartidas
    FROM imparten tu
    JOIN asignaturas a ON tu.codigo_asignatura = a.codigo AND tu.id_universidad = a.id_universidad
    WHERE tu.id_tutor = tutor_id;
END; 
$BODY$;

ALTER FUNCTION public.get_tutorias_impartidas(character varying)
    OWNER TO postgres;