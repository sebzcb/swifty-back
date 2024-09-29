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
