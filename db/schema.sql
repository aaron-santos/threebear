CREATE EXTENSION "uuid-ossp";

CREATE TABLE invitations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    startdate date NOT NULL,
    enddate date NOT NULL,
    numplayers int NOT NULL,
    createdby varchar(25) NOT NULL,
    CHECK (startdate < enddate)
);

CREATE TABLE invitationusers (
    invitationid uuid REFERENCES invitations ON DELETE CASCADE,
    googleid varchar(25) NOT NULL,
    accepted boolean NOT NULL,
    UNIQUE (invitationid, googleid)
);

CREATE TYPE scoringTileType AS ENUM ('');
CREATE TYPE terrainType AS ENUM ('');
CREATE TYPE buildingType AS ENUM ('');
CREATE TYPE boardCellLocation AS ENUM ('');
CREATE TYPE favorTileType AS ENUM ('');
CREATE TYPE bonusTileType AS ENUM ('');
CREATE TYPE raceType AS ENUM ('');

CREATE TABLE games (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    statedate date NOT NULL,
    startingUserId uuid,
    currentUserId uuid,
    round integer CHECK (round >= 0),
    scoringTile1 scoringTileType NOT NULL,
    scoringTile2 scoringTileType NOT NULL,
    scoringTile3 scoringTileType NOT NULL,
    scoringTile4 scoringTileType NOT NULL,
    scoringTile5 scoringTileType NOT NULL,
    scoringTile6 scoringTileType NOT NULL,
    powerAction1Used boolean NOT NULL,
    powerAction2Used boolean NOT NULL,
    powerAction3Used boolean NOT NULL,
    powerAction4Used boolean NOT NULL,
    powerAction5Used boolean NOT NULL,
    powerAction6Used boolean NOT NULL
);

CREATE TABLE gameusers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    gameid uuid REFERENCES games,
    googleid varchar(25) NOT NULL,
    raceType raceType,
    fireCultRank integer CHECK (fireCultRank >= 0),
    waterCultRank integer CHECK (waterCultRank >= 0),
    earthCultRank integer CHECK (earthCultRank >= 0),
    airCultRank integer CHECK (airCultRank >= 0),
    powerBowl1 integer CHECK (powerBowl1 >= 0),
    powerBowl2 integer CHECK (powerBowl2 >= 0),
    powerBowl3 integer CHECK (powerBowl3 >= 0),
    coins integer CHECK (coins >= 0),
    workers integer CHECK (workers >= 0),
    priests integer CHECK (priests >= 0),
    shippingRank integer CHECK (shippingRank >= 0),
    spadesRank integer, -- Giants do not have a spades ranking
    bonusTileType bonusTileType NOT NULL,

    UNIQUE (gameid, googleid)
);

ALTER TABLE games ADD CONSTRAINT sp_fk FOREIGN KEY (startingUserId) REFERENCES gameusers;
ALTER TABLE games ADD CONSTRAINT cp_fk FOREIGN KEY (currentUserId) REFERENCES gameusers;

CREATE TABLE bridge (
    gameUserId uuid REFERENCES gameusers,
    boardCellLocation1 boardCellLocation NOT NULL,
    boardCellLocation2 boardCellLocation NOT NULL,
    UNIQUE (gameUserId, boardCellLocation1, boardCellLocation2)
);

CREATE TABLE boardCell (
    gameId uuid REFERENCES games,
    location boardCellLocation NOT NULL,
    terrainType terrainType NOT NULL,
    buildingType buildingType, -- NULL == no building present
    buildingOwnerGameUserId uuid REFERENCES gameusers, -- NULL == no building present
    CHECK (buildingType IS NULL AND buildingOwnerGameUserId IS NULL
        OR buildingType IS NOT NULL AND buildingOwnerGameUserId IS NOT NULL)
);


