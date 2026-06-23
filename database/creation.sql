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
-- Table: Implantation
-- ----------------------------
CREATE TABLE Implantation (
    id_implantation INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle VARCHAR(100) NOT NULL,
    CONSTRAINT Implantation_PK PRIMARY KEY (id_implantation)
);


-- ----------------------------
-- Table: AccessibilitePMR
-- ----------------------------
CREATE TABLE AccessibilitePMR (
    id_pmr INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle VARCHAR(100) NOT NULL,
    CONSTRAINT AccessibilitePMR_PK PRIMARY KEY (id_pmr)
);


-- ----------------------------
-- Table: TypeTarif
-- ----------------------------
CREATE TABLE TypeTarif (
    id_type_tarif INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle VARCHAR(100) NOT NULL,
    CONSTRAINT TypeTarif_PK PRIMARY KEY (id_type_tarif)
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
-- Table: Raccordement
-- ----------------------------
CREATE TABLE Raccordement (
    id_raccordement INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle VARCHAR(100) NOT NULL,
    CONSTRAINT Raccordement_PK PRIMARY KEY (id_raccordement)
);


-- ----------------------------
-- Table: Departement
-- ----------------------------
CREATE TABLE Departement (
    code_departement VARCHAR(3) NOT NULL,
    nom_departement VARCHAR(100) NOT NULL,
    CONSTRAINT Departement_PK PRIMARY KEY (code_departement)
);


-- ----------------------------
-- Table: Commune
-- ----------------------------
CREATE TABLE Commune (
    code_insee CHAR(5) NOT NULL,
    nom_commune VARCHAR(100) NOT NULL,
    code_departement VARCHAR(3) NOT NULL,
    CONSTRAINT Commune_PK PRIMARY KEY (code_insee),
    CONSTRAINT Commune_code_departement_FK FOREIGN KEY (code_departement) REFERENCES Departement (code_departement)
);


-- ----------------------------
-- Table: ConditionAcces
-- ----------------------------
CREATE TABLE ConditionAcces (
    id_condition_acces INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle VARCHAR(50) NOT NULL,
    CONSTRAINT ConditionAcces_PK PRIMARY KEY (id_condition_acces)
);


-- ----------------------------
-- Table: Station
-- ----------------------------
CREATE TABLE Station (
    id_station VARCHAR(50) NOT NULL,
    nom_station VARCHAR(150) NOT NULL,
    adresse VARCHAR(150) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    id_condition_acces INT UNSIGNED NOT NULL,
    horaires VARCHAR(255),
    reservation TINYINT(1) NOT NULL DEFAULT False,
    date_service DATE,
    code_postal CHAR(5) NOT NULL,
    id_amenageur INT UNSIGNED NOT NULL,
    id_operateur INT UNSIGNED NOT NULL,
    code_insee CHAR(5) NOT NULL,
    id_implantation INT UNSIGNED NOT NULL,
    CONSTRAINT Station_PK PRIMARY KEY (id_station),
    CONSTRAINT Station_id_amenageur_FK FOREIGN KEY (id_amenageur) REFERENCES Amenageur (id_amenageur),
    CONSTRAINT Station_id_operateur_FK FOREIGN KEY (id_operateur) REFERENCES Operateur (id_operateur),
    CONSTRAINT Station_code_insee_FK FOREIGN KEY (code_insee) REFERENCES Commune (code_insee),
    CONSTRAINT Station_id_implantation_FK FOREIGN KEY (id_implantation) REFERENCES Implantation (id_implantation),
    CONSTRAINT Station_id_condition_acces_FK FOREIGN KEY (id_condition_acces) REFERENCES ConditionAcces (id_condition_acces)
);


-- ----------------------------
-- Table: Tarification
-- ----------------------------
CREATE TABLE Tarification (
    id_tarification INT UNSIGNED NOT NULL AUTO_INCREMENT,
    prix_kwh_norm DECIMAL(6,3),
    prix_min_norm DECIMAL(6,3),
    gratuit TINYINT(1),
    paiement_acte TINYINT(1) NOT NULL DEFAULT False,
    paiement_cb TINYINT(1) NOT NULL DEFAULT False,
    paiement_autre TINYINT(1) NOT NULL DEFAULT False,
    id_type_tarif INT UNSIGNED NOT NULL,
    CONSTRAINT Tarification_PK PRIMARY KEY (id_tarification),
    CONSTRAINT Tarification_id_type_tarif_FK FOREIGN KEY (id_type_tarif) REFERENCES TypeTarif (id_type_tarif)
);


-- ----------------------------
-- Table: possede
-- ----------------------------
CREATE TABLE possede (
    id_type_prise INT UNSIGNED NOT NULL,
    id_pdc VARCHAR(50) NOT NULL,
    CONSTRAINT possede_PK PRIMARY KEY (id_type_prise, id_pdc),
    CONSTRAINT possede_id_type_prise_FK FOREIGN KEY (id_type_prise) REFERENCES TypePrise (id_type_prise)
);


-- ----------------------------
-- Table: PointDeCharge
-- ----------------------------
CREATE TABLE PointDeCharge (
    id_pdc VARCHAR(50) NOT NULL,
    puissance DECIMAL(6,2) NOT NULL,
    restriction_gabarit VARCHAR(100),
    deux_roues TINYINT(1) NOT NULL DEFAULT False,
    cable_t2_attache TINYINT(1),
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_station VARCHAR(50) NOT NULL,
    id_raccordement INT UNSIGNED,
    id_pmr INT UNSIGNED,
    id_tarification INT UNSIGNED,
    CONSTRAINT PointDeCharge_PK PRIMARY KEY (id_pdc),
    CONSTRAINT PointDeCharge_id_station_FK FOREIGN KEY (id_station) REFERENCES Station (id_station),
    CONSTRAINT PointDeCharge_id_raccordement_FK FOREIGN KEY (id_raccordement) REFERENCES Raccordement (id_raccordement),
    CONSTRAINT PointDeCharge_id_tarification_FK FOREIGN KEY (id_tarification) REFERENCES Tarification (id_tarification)
);


-- ===== FOREIGN KEYS =====

ALTER TABLE possede
    ADD CONSTRAINT possede_id_pdc_FK FOREIGN KEY (id_pdc)
        REFERENCES PointDeCharge (id_pdc);

ALTER TABLE PointDeCharge
    ADD CONSTRAINT PointDeCharge_id_pmr_FK FOREIGN KEY (id_pmr)
        REFERENCES AccessibilitePMR  (id_pmr);

-- ===== INDEX =====
CREATE UNIQUE INDEX id_amenageur_UNQ ON Amenageur (id_amenageur);
CREATE UNIQUE INDEX siren_amenageur_UNQ ON Amenageur (siren_amenageur);
CREATE UNIQUE INDEX id_implantation_UNQ ON Implantation (id_implantation);
CREATE UNIQUE INDEX libelle_UNQ ON Implantation (libelle);
CREATE UNIQUE INDEX id_pmr_UNQ ON AccessibilitePMR (id_pmr);
CREATE UNIQUE INDEX libelle_UNQ ON AccessibilitePMR (libelle);
CREATE UNIQUE INDEX id_type_tarif_UNQ ON TypeTarif (id_type_tarif);
CREATE UNIQUE INDEX libelle_UNQ ON TypeTarif (libelle);
CREATE UNIQUE INDEX id_operateur_UNQ ON Operateur (id_operateur);

CREATE UNIQUE INDEX code_operateur_complet_UNQ ON Operateur (code_pays_operateur, code_operateur);
CREATE UNIQUE INDEX id_type_prise_UNQ ON TypePrise (id_type_prise);
CREATE UNIQUE INDEX libelle_UNQ ON TypePrise (libelle);
CREATE UNIQUE INDEX id_raccordement_UNQ ON Raccordement (id_raccordement);
CREATE UNIQUE INDEX libelle_UNQ ON Raccordement (libelle);
CREATE UNIQUE INDEX code_insee_UNQ ON Commune (code_insee);
CREATE INDEX code_departement_IDX ON Commune (code_departement);
CREATE UNIQUE INDEX code_departement_UNQ ON Departement (code_departement);
CREATE UNIQUE INDEX id_condition_acces_UNQ ON ConditionAcces (id_condition_acces);
CREATE UNIQUE INDEX libelle_UNQ ON ConditionAcces (libelle);
CREATE UNIQUE INDEX id_station_UNQ ON Station (id_station);

CREATE INDEX id_amenageur_IDX ON Station (id_amenageur);
CREATE INDEX id_operateur_IDX ON Station (id_operateur);
CREATE INDEX code_insee_IDX ON Station (code_insee);
CREATE INDEX id_implantation_IDX ON Station (id_implantation);
CREATE INDEX id_condition_acces_IDX ON Station (id_condition_acces);
CREATE UNIQUE INDEX id_tarification_UNQ ON Tarification (id_tarification);
CREATE INDEX id_type_tarif_IDX ON Tarification (id_type_tarif);

CREATE INDEX id_type_prise_IDX ON possede (id_type_prise);
CREATE INDEX id_pdc_IDX ON possede (id_pdc);
CREATE UNIQUE INDEX id_pdc_UNQ ON PointDeCharge (id_pdc);

CREATE INDEX id_station_IDX ON PointDeCharge (id_station);
CREATE INDEX id_raccordement_IDX ON PointDeCharge (id_raccordement);
CREATE INDEX id_pmr_IDX ON PointDeCharge (id_pmr);
CREATE UNIQUE INDEX id_tarification_UNQ ON PointDeCharge (id_tarification);