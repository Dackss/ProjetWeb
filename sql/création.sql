-- ----------------------------
-- Table: Amenageur
-- ----------------------------
CREATE TABLE Amenageur (
    id_amenageur INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom_amenageur VARCHAR(150) NOT NULL,
    siren_amenageur VARCHAR(9),
    contact_amenageur VARCHAR(150),
    CONSTRAINT Amenageur_PK PRIMARY KEY (id_amenageur)
);


-- ----------------------------
-- Table: Operateur
-- ----------------------------
CREATE TABLE Operateur (
    id_operateur INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code_pays_operateur CHAR(2) NOT NULL,
    code_operateur VARCHAR(5) NOT NULL,
    nom_operateur VARCHAR(150) NOT NULL,
    enseigne VARCHAR(150),
    contact_operateur VARCHAR(150),
    CONSTRAINT Operateur_PK PRIMARY KEY (id_operateur)
);


-- ----------------------------
-- Table: TypePrise
-- ----------------------------
CREATE TABLE TypePrise (
    id_type_prise INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle VARCHAR(50) NOT NULL,
    CONSTRAINT TypePrise_PK PRIMARY KEY (id_type_prise)
);


-- ----------------------------
-- Table: Commune
-- ----------------------------
CREATE TABLE Commune (
    code_insee CHAR(5) NOT NULL,
    nom_commune VARCHAR(100) NOT NULL,
    code_postal CHAR(5) NOT NULL,
    CONSTRAINT Commune_PK PRIMARY KEY (code_insee)
);


-- ----------------------------
-- Table: Station
-- ----------------------------
CREATE TABLE Station (
    id_station VARCHAR(50) NOT NULL,
    nom_station VARCHAR(150) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    implantation ENUM(
        'Parking privé à usage public',
        'Voirie',
        'Parking public',
        'Parking privé réservé à la clientèle',
        'Station dédiée à la recharge rapide'
    ) NOT NULL,
     condition_acces ENUM('Accès libre','Accès réservé') NOT NULL,
     horaires VARCHAR(50),
     reservation TINYINT(1) NOT NULL DEFAULT FALSE,
     date_service DATE,
     id_amenageur INT UNSIGNED NOT NULL,
     id_operateur INT UNSIGNED NOT NULL,
     code_insee CHAR(5) NOT NULL,
     CONSTRAINT Station_PK PRIMARY KEY (id_station),
     CONSTRAINT Station_id_amenageur_FK FOREIGN KEY (id_amenageur) REFERENCES Amenageur (id_amenageur),
     CONSTRAINT Station_id_operateur_FK FOREIGN KEY (id_operateur) REFERENCES Operateur (id_operateur),
     CONSTRAINT Station_code_insee_FK FOREIGN KEY (code_insee) REFERENCES Commune (code_insee)
);


-- ----------------------------
-- Table: PointDeCharge
-- ----------------------------
CREATE TABLE PointDeCharge (
    id_pdc VARCHAR(50) NOT NULL,
    puissance DECIMAL(6,2) NOT NULL,
    pmr TINYINT(1),
    restriction_gabarit VARCHAR(100),
    deux_roues TINYINT(1) NOT NULL DEFAULT FALSE,
    raccordement ENUM('Direct','Indirect','inconnu'),
    cable_t2_attache TINYINT(1),
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_station VARCHAR(50) NOT NULL,
    CONSTRAINT PointDeCharge_PK PRIMARY KEY (id_pdc),
    CONSTRAINT PointDeCharge_id_station_FK FOREIGN KEY (id_station) REFERENCES Station (id_station)
);


-- ----------------------------
-- Table: Tarification
-- ----------------------------
CREATE TABLE Tarification (
    id_tarification INT UNSIGNED NOT NULL AUTO_INCREMENT,
    type_tarif ENUM('inconnu','composite','kwh','forfait','gratuit','temps') NOT NULL DEFAULT 'inconnu',
    prix_kwh_norm DECIMAL(6,3),
    prix_min_norm DECIMAL(6,3),
    gratuit TINYINT(1),
    paiement_acte TINYINT(1) NOT NULL DEFAULT FALSE,
    paiement_cb TINYINT(1) NOT NULL DEFAULT FALSE,
    paiement_autre TINYINT(1) NOT NULL DEFAULT FALSE,
    id_pdc VARCHAR(50) NOT NULL,
    CONSTRAINT Tarification_PK PRIMARY KEY (id_tarification),
    CONSTRAINT Tarification_id_pdc_FK FOREIGN KEY (id_pdc) REFERENCES PointDeCharge (id_pdc)
);


-- ----------------------------
-- Table: possede (association N:N PointDeCharge <-> TypePrise)
-- ----------------------------
CREATE TABLE possede (
    id_type_prise INT UNSIGNED NOT NULL,
    id_pdc VARCHAR(50) NOT NULL,
    CONSTRAINT possede_PK PRIMARY KEY (id_type_prise, id_pdc),
    CONSTRAINT possede_id_type_prise_FK FOREIGN KEY (id_type_prise) REFERENCES TypePrise (id_type_prise),
    CONSTRAINT possede_id_pdc_FK FOREIGN KEY (id_pdc) REFERENCES PointDeCharge (id_pdc)
);


-- ===== INDEX =====
CREATE UNIQUE INDEX Amenageur_siren_UNQ ON Amenageur (siren_amenageur);
CREATE UNIQUE INDEX Operateur_code_complet_UNQ ON Operateur (code_pays_operateur, code_operateur);
CREATE UNIQUE INDEX TypePrise_libelle_UNQ ON TypePrise (libelle);
CREATE UNIQUE INDEX Tarification_id_pdc_UNQ ON Tarification (id_pdc);

CREATE INDEX Station_id_amenageur_IDX ON Station (id_amenageur);
CREATE INDEX Station_id_operateur_IDX ON Station (id_operateur);
CREATE INDEX Station_code_insee_IDX ON Station (code_insee);
CREATE INDEX Station_geo_IDX ON Station (latitude, longitude);
CREATE INDEX PointDeCharge_id_station_IDX ON PointDeCharge (id_station);
CREATE INDEX possede_id_pdc_IDX ON possede (id_pdc);


-- ----------------------------
-- Donnees de reference : TypePrise
-- ----------------------------
INSERT INTO TypePrise (libelle) VALUES
    ('EF'),
    ('Type 2'),
    ('Combo CCS'),
    ('CHAdeMO'),
    ('Autre');