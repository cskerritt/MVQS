-- ----------------------------------------------------------
-- MDB Tools - A library for reading MS Access database files
-- Copyright (C) 2000-2011 Brian Bruns and others.
-- Files in libmdb are licensed under LGPL and the utilities under
-- the GPL, see COPYING.LIB and COPYING files respectively.
-- Check out http://mdbtools.sourceforge.net
-- ----------------------------------------------------------

-- That file uses encoding UTF-8

CREATE TABLE `tblMVQS_Export_to_Excel`
 (
	`PersonID`			INTEGER, 
	`Evaluee_Name`			varchar, 
	`Dot_Code`			varchar, 
	`Title`			varchar, 
	`TS`			REAL, 
	`VA`			REAL, 
	`Svp`			varchar, 
	`SVPDescription`			varchar, 
	`SVPSkill`			varchar, 
	`VIPRType`			varchar, 
	`VQ`			REAL, 
	`GEDR1`			INTEGER, 
	`GEDM1`			INTEGER, 
	`GEDL1`			INTEGER, 
	`SVP1`			INTEGER, 
	`APTS1`			INTEGER, 
	`APTP1`			INTEGER, 
	`APTQ1`			INTEGER, 
	`APTK1`			INTEGER, 
	`APTF1`			INTEGER, 
	`APTM1`			INTEGER, 
	`APTE1`			INTEGER, 
	`APTC1`			INTEGER, 
	`PD11`			INTEGER, 
	`PD21`			INTEGER, 
	`PD31`			INTEGER, 
	`PD41`			INTEGER, 
	`PD51`			INTEGER, 
	`PD61`			INTEGER, 
	`EC11`			INTEGER, 
	`EC21`			INTEGER, 
	`EC31`			INTEGER, 
	`EC41`			INTEGER, 
	`EC51`			INTEGER, 
	`EC61`			INTEGER, 
	`EC71`			INTEGER
);

-- CREATE INDEXES ...

CREATE TABLE `tblOccupations_SELECT`
 (
	`OccupationID`			INTEGER, 
	`PersonID`			INTEGER, 
	`PersonName`			varchar, 
	`Work_CountryID`			INTEGER, 
	`Work_State`			varchar, 
	`Work_CountyNumber`			INTEGER, 
	`Occupation_Select_ID`			INTEGER, 
	`Dot_Code`			varchar, 
	`Title`			varchar, 
	`Doc_No`			varchar, 
	`Ind1`			varchar, 
	`Ind2`			varchar, 
	`Ind3`			varchar, 
	`Ind4`			varchar, 
	`GOE`			varchar, 
	`SIC`			varchar, 
	`SOC`			varchar, 
	`WF1`			varchar, 
	`WF2`			varchar, 
	`WF3`			varchar, 
	`MPSMS1`			varchar, 
	`MPSMS2`			varchar, 
	`MPSMS3`			varchar, 
	`DefnType`			varchar, 
	`Update`			varchar, 
	`VQ`			REAL, 
	`Data`			INTEGER, 
	`People`			INTEGER, 
	`Things`			INTEGER, 
	`GEDR1`			INTEGER, 
	`GEDM1`			INTEGER, 
	`GEDL1`			INTEGER, 
	`SVP1`			INTEGER, 
	`APTG1`			INTEGER, 
	`APTV1`			INTEGER, 
	`APTN1`			INTEGER, 
	`APTS1`			INTEGER, 
	`APTP1`			INTEGER, 
	`APTQ1`			INTEGER, 
	`APTK1`			INTEGER, 
	`APTF1`			INTEGER, 
	`APTM1`			INTEGER, 
	`APTE1`			INTEGER, 
	`APTC1`			INTEGER, 
	`PD11`			INTEGER, 
	`PD21`			INTEGER, 
	`PD31`			INTEGER, 
	`PD41`			INTEGER, 
	`PD51`			INTEGER, 
	`PD61`			INTEGER, 
	`EC11`			INTEGER, 
	`EC21`			INTEGER, 
	`EC31`			INTEGER, 
	`EC41`			INTEGER, 
	`EC51`			INTEGER, 
	`EC61`			INTEGER, 
	`EC71`			INTEGER, 
	`Zone1`			INTEGER, 
	`Survcdnw`			varchar, 
	`A01LV00M`			REAL, 
	`A02LV00M`			REAL, 
	`A03LV00M`			REAL, 
	`A04LV00M`			REAL, 
	`A05LV00M`			REAL, 
	`A06LV00M`			REAL, 
	`A07LV00M`			REAL, 
	`A08LV00M`			REAL, 
	`A09LV00M`			REAL, 
	`A10LV00M`			REAL, 
	`A11LV00M`			REAL, 
	`A12LV00M`			REAL, 
	`A13LV00M`			REAL, 
	`A14LV00M`			REAL, 
	`A15LV00M`			REAL, 
	`A16LV00M`			REAL, 
	`A17LV00M`			REAL, 
	`A18LV00M`			REAL, 
	`A19LV00M`			REAL, 
	`A20LV00M`			REAL, 
	`A21LV00M`			REAL, 
	`A22LV00M`			REAL, 
	`A23LV00M`			REAL, 
	`A24LV00M`			REAL, 
	`A25LV00M`			REAL, 
	`A26LV00M`			REAL, 
	`A27LV00M`			REAL, 
	`A28LV00M`			REAL, 
	`A29LV00M`			REAL, 
	`A30LV00M`			REAL, 
	`A31LV00M`			REAL, 
	`A32LV00M`			REAL, 
	`A33LV00M`			REAL, 
	`A34LV00M`			REAL, 
	`A35LV00M`			REAL, 
	`A36LV00M`			REAL, 
	`A37LV00M`			REAL, 
	`A38LV00M`			REAL, 
	`A39LV00M`			REAL, 
	`A40LV00M`			REAL, 
	`A41LV00M`			REAL, 
	`A42LV00M`			REAL, 
	`A43LV00M`			REAL, 
	`A44LV00M`			REAL, 
	`A45LV00M`			REAL, 
	`A46LV00M`			REAL, 
	`A47LV00M`			REAL, 
	`A48LV00M`			REAL, 
	`A49LV00M`			REAL, 
	`A50LV00M`			REAL, 
	`A51LV00M`			REAL, 
	`A52LV00M`			REAL, 
	`W36FN00M`			REAL, 
	`W37FN00M`			REAL, 
	`W38FN00M`			REAL, 
	`W39FN00M`			REAL, 
	`W40FN00M`			REAL, 
	`W41FN00M`			REAL, 
	`W42FN00M`			REAL, 
	`W43FN00M`			REAL, 
	`W44FN00M`			REAL, 
	`W45FN00M`			REAL, 
	`W46FN00M`			REAL, 
	`W47FN00M`			REAL, 
	`W60FN00M`			REAL, 
	`W61FN00M`			REAL, 
	`W62FN00M`			REAL, 
	`W63FN00M`			REAL, 
	`W64FN00M`			REAL, 
	`W65FN00M`			REAL, 
	`W66FN00M`			REAL, 
	`W67FN00M`			REAL, 
	`W68FN00M`			REAL, 
	`W98FN00M`			REAL, 
	`W99FN00M`			REAL, 
	`JobDescription`			TEXT, 
	`VIPRType`			varchar, 
	`Select`			INTEGER NOT NULL, 
	`ONETCAT`			varchar, 
	`ONETCODE`			varchar, 
	`ONETTITLE`			varchar, 
	`ONETDESC`			varchar
	, PRIMARY KEY (`Occupation_Select_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblOccupations_SELECT_DocNo_idx` ON `tblOccupations_SELECT` (`Doc_No`);
CREATE INDEX `tblOccupations_SELECT_DOT_idx` ON `tblOccupations_SELECT` (`Dot_Code`);
CREATE INDEX `tblOccupations_SELECT_OccupationID_idx` ON `tblOccupations_SELECT` (`OccupationID`);
CREATE INDEX `tblOccupations_SELECT_ONETCODE_idx` ON `tblOccupations_SELECT` (`ONETCODE`);
CREATE INDEX `tblOccupations_SELECT_PersonID_idx` ON `tblOccupations_SELECT` (`PersonID`);

CREATE TABLE `tblSystem_DatabaseTypes`
 (
	`DatabaseTypeID`			INTEGER NOT NULL, 
	`DatabaseTypeDescription`			varchar, 
	`DatabaseTypeComments`			TEXT, 
	`DatabaseTypeLocation`			varchar, 
	`CreatedByID`			INTEGER, 
	`CreatedDateTime`			DateTime, 
	`SortOrder`			INTEGER
	, PRIMARY KEY (`DatabaseTypeID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblSystem_DatabaseTypes_CreatedByID_idx` ON `tblSystem_DatabaseTypes` (`CreatedByID`);
CREATE INDEX `tblSystem_DatabaseTypes_DatabaseTypeID_idx` ON `tblSystem_DatabaseTypes` (`DatabaseTypeID`);

CREATE TABLE `tblSystem_Monitor_Resolutions`
 (
	`Monitor_Resolution_ID`			INTEGER, 
	`Aspect_Ratio`			varchar, 
	`Definition`			varchar, 
	`Monitor_Resolution`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Monitor_Resolution_ID`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblSystem_ReleaseNotes_Application`
 (
	`Version`			varchar NOT NULL, 
	`DevelopmentStartDate`			DateTime, 
	`ReleaseDate`			DateTime, 
	`Comments`			TEXT
	, PRIMARY KEY (`Version`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Help`
 (
	`HelpCode`			INTEGER, 
	`Help_Title`			varchar, 
	`MVQS_Category`			varchar, 
	`HelpText`			TEXT, 
	`HelpIndex`			varchar, 
	`HelpForm`			varchar, 
	`MVQS_Grouping`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`HelpCode`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Help_Help_Category_idx` ON `tblXLU_Help` (`Help_Title`);
CREATE INDEX `tblXLU_Help_Help_Category1_idx` ON `tblXLU_Help` (`MVQS_Category`);
CREATE INDEX `tblXLU_Help_HelpCode_idx` ON `tblXLU_Help` (`HelpCode`);
CREATE UNIQUE INDEX `tblXLU_Help_HelpIndex_idx` ON `tblXLU_Help` (`HelpIndex`);
CREATE INDEX `tblXLU_Help_Sort_Order_idx` ON `tblXLU_Help` (`Sort_Order`);

CREATE TABLE `tblXLU_Help_Old`
 (
	`HelpCode`			INTEGER, 
	`Help_Category`			varchar, 
	`HelpText`			TEXT, 
	`HelpIndex`			varchar, 
	`HelpForm`			varchar, 
	`MVQS_Grouping`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`HelpCode`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Help_Old_Help_Category_idx` ON `tblXLU_Help_Old` (`Help_Category`);
CREATE INDEX `tblXLU_Help_Old_HelpCode_idx` ON `tblXLU_Help_Old` (`HelpCode`);
CREATE UNIQUE INDEX `tblXLU_Help_Old_HelpIndex_idx` ON `tblXLU_Help_Old` (`HelpIndex`);
CREATE INDEX `tblXLU_Help_Old_Sort_Order_idx` ON `tblXLU_Help_Old` (`Sort_Order`);

CREATE TABLE `tblEvaluee_Ratings_SUMMARY_PV`
 (
	`PersonID`			INTEGER, 
	`VariableNumber`			varchar, 
	`Rating`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Ratings_SUMMARY_PV_PersonID_idx` ON `tblEvaluee_Ratings_SUMMARY_PV` (`PersonID`);


