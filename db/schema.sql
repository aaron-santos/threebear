CREATE TABLE invitations (
    id uuid PRIMARY KEY,
    startdate date NOT NULL,
    enddate date NOT NULL,
    numplayers int NOT NULL,
    CHECK (startdate < enddate)
);

CREATE TABLE invitationusers (
    invitationid uuid REFERENCES invitations (id) ON DELETE CASCADE,
    googleid varchar(25) NOT NULL,
    accepted boolean NOT NULL,
    UNIQUE (invitationid, googleid)
);

CREATE TABLE games (
    id uuid PRIMARY KEY,
    statedate date NOT NULL,
    data JSON NOT NULL
);

CREATE TABLE gameusers (
    gameid uuid REFERENCES games (id),
    googleid varchar(25) NOT NULL,
    data JSON NOT NULL,
    UNIQUE (gameid, googleid)
);


