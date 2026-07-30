CREATE DATABASE BolsaTrabajoUPQ
GO

USE BolsaTrabajoUPQ
GO


CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    TipoUsuario NVARCHAR(20) NOT NULL CHECK (TipoUsuario IN ('candidato', 'empresa', 'admin')),
    FechaRegistro DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);
GO


CREATE TABLE Candidatos (
    CandidatoID INT PRIMARY KEY,
    UsuarioID INT UNIQUE NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    ApellidoPaterno NVARCHAR(50) NOT NULL,
    ApellidoMaterno NVARCHAR(50),
    Telefono NVARCHAR(20),
    EstadoCivil NVARCHAR(20),
    Sexo NVARCHAR(10),
    FechaNacimiento DATE,
    Nacionalidad NVARCHAR(50),
    RFC NVARCHAR(20),
    Direccion NVARCHAR(200),
    Reubicacion BIT DEFAULT 0,
    Viajar BIT DEFAULT 0,
    LicenciaConducir BIT DEFAULT 0,
    ModalidadTrabajo NVARCHAR(50),
    PuestoActual NVARCHAR(100),
    PuestoSolicitado NVARCHAR(100),
    FotoPerfil NVARCHAR(255),
    CV NVARCHAR(255),
    ResumenProfesional NVARCHAR(MAX),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);
GO


CREATE TABLE Empresas (
    EmpresaID INT PRIMARY KEY,
    UsuarioID INT UNIQUE NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Direccion NVARCHAR(200),
    Telefono NVARCHAR(20),
    SitioWeb NVARCHAR(100),
    Descripcion NVARCHAR(MAX),
    Logo NVARCHAR(255),
    FechaRegistro DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);
GO


CREATE TABLE Administradores (
    AdministradorID INT PRIMARY KEY,
    UsuarioID INT UNIQUE NOT NULL,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);
GO


CREATE TABLE PreparacionAcademica (
    PreparacionID INT PRIMARY KEY IDENTITY(1,1),
    CandidatoID INT NOT NULL,
    Grado NVARCHAR(50) NOT NULL,
    Cedula NVARCHAR(50),
    Estatus NVARCHAR(20) NOT NULL,
    Institucion NVARCHAR(100) NOT NULL,
    Pais NVARCHAR(50) NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE,
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID)
);
GO


CREATE TABLE ExperienciaLaboral (
    ExperienciaID INT PRIMARY KEY IDENTITY(1,1),
    CandidatoID INT NOT NULL,
    Empresa NVARCHAR(100) NOT NULL,
    Domicilio NVARCHAR(200),
    Telefono NVARCHAR(20),
    Puesto NVARCHAR(100) NOT NULL,
    FechaIngreso DATE NOT NULL,
    FechaSalida DATE,
    Funciones NVARCHAR(MAX) NOT NULL,
    SueldoInicial DECIMAL(10,2),
    SueldoFinal DECIMAL(10,2),
    MotivoSeparacion NVARCHAR(200),
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID)
);
GO


CREATE TABLE Referencias (
    ReferenciaID INT PRIMARY KEY IDENTITY(1,1),
    CandidatoID INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Ocupacion NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(20) NOT NULL,
    AnosConocer INT NOT NULL,
    Empresa NVARCHAR(100),
    Documento NVARCHAR(255),
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID)
);
GO


CREATE TABLE Habilidades (
    HabilidadID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) UNIQUE NOT NULL
);
GO


CREATE TABLE CandidatoHabilidades (
    CandidatoID INT NOT NULL,
    HabilidadID INT NOT NULL,
    PRIMARY KEY (CandidatoID, HabilidadID),
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID),
    FOREIGN KEY (HabilidadID) REFERENCES Habilidades(HabilidadID)
);
GO


CREATE TABLE Competencias (
    CompetenciaID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) UNIQUE NOT NULL
);
GO


CREATE TABLE CandidatoCompetencias (
    CandidatoID INT NOT NULL,
    CompetenciaID INT NOT NULL,
    PRIMARY KEY (CandidatoID, CompetenciaID),
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID),
    FOREIGN KEY (CompetenciaID) REFERENCES Competencias(CompetenciaID)
);
GO

CREATE TABLE Vacantes (
    VacanteID INT PRIMARY KEY IDENTITY(1,1),
    EmpresaID INT NOT NULL,
    Puesto NVARCHAR(100) NOT NULL,
    GradoEstudios NVARCHAR(50) NOT NULL,
    Resumen NVARCHAR(MAX) NOT NULL,
    Plazas INT NOT NULL DEFAULT 1,
    PlazasDisponibles INT NOT NULL DEFAULT 1,
    Estatus NVARCHAR(20) NOT NULL CHECK (Estatus IN ('en_revision', 'aprobada', 'rechazada', 'cerrada')),
    FechaPublicacion DATETIME DEFAULT GETDATE(),
    FechaAprobacion DATETIME,
    ComentariosAdmin NVARCHAR(MAX),
    Salario NVARCHAR(100),
    TipoContrato NVARCHAR(50) NOT NULL,
    Modalidad NVARCHAR(20) NOT NULL,
    Ubicacion NVARCHAR(200),
    ExperienciaRequerida NVARCHAR(50) NOT NULL,
    Beneficios NVARCHAR(MAX),
    FechaCierre DATE,
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);
GO



CREATE TABLE VacanteHabilidadesRequeridas (
    VacanteID INT NOT NULL,
    HabilidadID INT NOT NULL,
    PRIMARY KEY (VacanteID, HabilidadID),
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID),
    FOREIGN KEY (HabilidadID) REFERENCES Habilidades(HabilidadID)
);
GO


CREATE TABLE VacanteHabilidadesOpcionales (
    VacanteID INT NOT NULL,
    HabilidadID INT NOT NULL,
    PRIMARY KEY (VacanteID, HabilidadID),
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID),
    FOREIGN KEY (HabilidadID) REFERENCES Habilidades(HabilidadID)
);
GO


CREATE TABLE Postulaciones (
    PostulacionID INT PRIMARY KEY IDENTITY(1,1),
    VacanteID INT NOT NULL,
    CandidatoID INT NOT NULL,
    FechaPostulacion DATETIME DEFAULT GETDATE(),
    Estatus NVARCHAR(20) NOT NULL CHECK (Estatus IN ('pendiente', 'aceptado', 'rechazado')),
    Comentarios NVARCHAR(MAX),
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID),
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID),
    CONSTRAINT UQ_Postulacion UNIQUE (VacanteID, CandidatoID)
);
GO


CREATE TABLE Notificaciones (
    NotificacionID INT PRIMARY KEY IDENTITY(1,1),
    EmpresaID INT NOT NULL,
    Mensaje NVARCHAR(255) NOT NULL,
    Tipo NVARCHAR(20) NOT NULL,
    Fecha DATETIME DEFAULT GETDATE(),
    Leida BIT DEFAULT 0,
    VacanteID INT,
    Comentarios NVARCHAR(MAX),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID)
);
GO


CREATE TABLE VacantesRevision (
    AdministradorID INT NOT NULL,
    VacanteID INT NOT NULL,
    PRIMARY KEY (AdministradorID, VacanteID),
    FOREIGN KEY (AdministradorID) REFERENCES Administradores(AdministradorID),
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID)
);
GO


CREATE TABLE VacantesAprobadas (
    AdministradorID INT NOT NULL,
    VacanteID INT NOT NULL,
    PRIMARY KEY (AdministradorID, VacanteID),
    FOREIGN KEY (AdministradorID) REFERENCES Administradores(AdministradorID),
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID)
);
GO


INSERT INTO Usuarios (Email, PasswordHash, TipoUsuario) VALUES 
('admin@upq.edu.mx', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin'),
('candidato@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'candidato'),
('empresa@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'empresa');
GO

INSERT INTO Administradores (AdministradorID, UsuarioID) VALUES (1, 1);
GO

INSERT INTO Candidatos (CandidatoID, UsuarioID, Nombre, ApellidoPaterno, ApellidoMaterno) 
VALUES (1, 2, 'Juan', 'Perez', 'Gomez');
GO

INSERT INTO Empresas (EmpresaID, UsuarioID, Nombre) 
VALUES (1, 3, 'Empresa Ejemplo S.A.');
GO


INSERT INTO Habilidades (Nombre) VALUES 
('Python'), ('Java'), ('SQL'), ('JavaScript'), ('Flask'), ('Django'), ('HTML/CSS'), ('Git');
GO

select * from Candidatos

select * from usuarios

select * from PreparacionAcademica

select * from ExperienciaLaboral

select * from habilidades

select * from Referencias

select * from empresas

select * from Vacantes

select * from Administradores

select * from Conversaciones
select * from Mensajes

ALTER TABLE Usuarios ADD ResetToken NVARCHAR(100) NULL;
ALTER TABLE Usuarios ADD ResetTokenExpira DATETIME NULL;

-- Tabla de conversaciones
CREATE TABLE Conversaciones (
    ConversacionID INT IDENTITY(1,1) PRIMARY KEY,
    VacanteID INT NOT NULL,
    CandidatoID INT NOT NULL,
    EmpresaID INT NOT NULL,
    FechaInicio DATETIME DEFAULT GETDATE(),
    Activa BIT DEFAULT 1,
    FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID),
    FOREIGN KEY (CandidatoID) REFERENCES Candidatos(CandidatoID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Tabla de mensajes
CREATE TABLE Mensajes (
    MensajeID INT IDENTITY(1,1) PRIMARY KEY,
    ConversacionID INT NOT NULL,
    RemitenteID INT NOT NULL, -- ID del usuario que envía
    RemitenteTipo VARCHAR(20) NOT NULL, -- 'candidato' o 'empresa'
    Mensaje TEXT NOT NULL,
    FechaEnvio DATETIME DEFAULT GETDATE(),
    Leido BIT DEFAULT 0,
    FechaLectura DATETIME NULL,
    FOREIGN KEY (ConversacionID) REFERENCES Conversaciones(ConversacionID)
);

-- Índices para mejorar rendimiento
CREATE INDEX IX_Mensajes_Conversacion ON Mensajes(ConversacionID);
CREATE INDEX IX_Mensajes_Leido ON Mensajes(Leido);
CREATE INDEX IX_Conversaciones_Vacante ON Conversaciones(VacanteID);