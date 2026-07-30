INSERT INTO habilidades (nombre) VALUES
  ('Python'), ('Java'), ('SQL'), ('JavaScript'), ('Flask'), ('Django'), ('HTML/CSS'), ('Git')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO competencias (nombre) VALUES
  ('Liderazgo'), ('Trabajo en equipo'), ('Comunicación efectiva'),
  ('Resolución de problemas'), ('Pensamiento crítico'), ('Adaptabilidad'),
  ('Gestión del tiempo'), ('Creatividad')
ON CONFLICT (nombre) DO NOTHING;
