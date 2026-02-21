-- ----------------------------------------------------------
-- MDB Tools - A library for reading MS Access database files
-- Copyright (C) 2000-2011 Brian Bruns and others.
-- Files in libmdb are licensed under LGPL and the utilities under
-- the GPL, see COPYING.LIB and COPYING files respectively.
-- Check out http://mdbtools.sourceforge.net
-- ----------------------------------------------------------

-- That file uses encoding UTF-8

CREATE TABLE `tblClients`
 (
	`ClientID`			INTEGER, 
	`Client_Name`			varchar, 
	`Address_Line_1`			varchar, 
	`Address_Line_2`			varchar, 
	`City`			varchar, 
	`State`			varchar, 
	`Zip`			varchar, 
	`Country`			varchar, 
	`Website`			varchar, 
	`Email`			varchar, 
	`MainPhone`			varchar, 
	`MainFax`			varchar, 
	`SecondPhone`			varchar, 
	`Client_Notes`			TEXT, 
	`Client_Folder`			varchar
	, PRIMARY KEY (`ClientID`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblClientWorkHistoryArchive`
 (
	`ClientID`			INTEGER, 
	`TitleID`			INTEGER, 
	`DOTCode`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblClientWorkHistoryArchive_ClientID_idx` ON `tblClientWorkHistoryArchive` (`ClientID`);
CREATE INDEX `tblClientWorkHistoryArchive_DOTCode_idx` ON `tblClientWorkHistoryArchive` (`TitleID`);
CREATE INDEX `tblClientWorkHistoryArchive_DOTCode1_idx` ON `tblClientWorkHistoryArchive` (`DOTCode`);

CREATE TABLE `tblEvaluee_Job_Bank`
 (
	`PersonID`			INTEGER, 
	`CountryID`			INTEGER, 
	`CountyNumber`			INTEGER, 
	`State`			varchar, 
	`StateID`			INTEGER, 
	`Dot_Code`			varchar, 
	`Title`			varchar, 
	`Doc_No`			varchar, 
	`JOBCAT`			varchar, 
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
	`VIPRType`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Job_Bank_CountryID_idx` ON `tblEvaluee_Job_Bank` (`CountryID`);
CREATE INDEX `tblEvaluee_Job_Bank_Dot_Code_idx` ON `tblEvaluee_Job_Bank` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Job_Bank_PersonID_idx` ON `tblEvaluee_Job_Bank` (`PersonID`);
CREATE INDEX `tblEvaluee_Job_Bank_StateID_idx` ON `tblEvaluee_Job_Bank` (`StateID`);

CREATE TABLE `tblEvaluee_Job_Bank_Value_Variance`
 (
	`PersonID`			INTEGER, 
	`Dot_Code`			varchar, 
	`V01`			REAL, 
	`V02`			REAL, 
	`V03`			REAL, 
	`V04`			REAL, 
	`V05`			REAL, 
	`V06`			REAL, 
	`V07`			REAL, 
	`V08`			REAL, 
	`V09`			REAL, 
	`V10`			REAL, 
	`V11`			REAL, 
	`V12`			REAL, 
	`V13`			REAL, 
	`V14`			REAL, 
	`V15`			REAL, 
	`V16`			REAL, 
	`V17`			REAL, 
	`V18`			REAL, 
	`V19`			REAL, 
	`V20`			REAL, 
	`V21`			REAL, 
	`TotalVV`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Job_Bank_Value_Variance_Dot_Code_idx` ON `tblEvaluee_Job_Bank_Value_Variance` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Job_Bank_Value_Variance_PersonID_idx` ON `tblEvaluee_Job_Bank_Value_Variance` (`PersonID`);

CREATE TABLE `tblEvaluee_Occupations`
 (
	`Evaluee_Occupation_ID`			INTEGER, 
	`PersonID`			INTEGER, 
	`OccupationID`			INTEGER, 
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
	`CEN`			varchar, 
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
	, PRIMARY KEY (`Evaluee_Occupation_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Occupations_DocNo_idx` ON `tblEvaluee_Occupations` (`Doc_No`);
CREATE INDEX `tblEvaluee_Occupations_DOT_idx` ON `tblEvaluee_Occupations` (`Dot_Code`);
CREATE UNIQUE INDEX `tblEvaluee_Occupations_Evaluee_Occupation_ID_idx` ON `tblEvaluee_Occupations` (`Evaluee_Occupation_ID`);
CREATE INDEX `tblEvaluee_Occupations_OccupationID_idx` ON `tblEvaluee_Occupations` (`OccupationID`);
CREATE INDEX `tblEvaluee_Occupations_ONETCODE_idx` ON `tblEvaluee_Occupations` (`ONETCODE`);
CREATE INDEX `tblEvaluee_Occupations_PersonID_idx` ON `tblEvaluee_Occupations` (`PersonID`);

CREATE TABLE `tblEvaluee_Other_Referral_Sources`
 (
	`PersonID`			INTEGER, 
	`Evaluee_Other_Clients_ID`			INTEGER, 
	`ClientID`			INTEGER, 
	`Other_Client_Notes`			TEXT, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Evaluee_Other_Clients_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Other_Referral_Sources_ClientID_idx` ON `tblEvaluee_Other_Referral_Sources` (`PersonID`);
CREATE INDEX `tblEvaluee_Other_Referral_Sources_ClientID1_idx` ON `tblEvaluee_Other_Referral_Sources` (`ClientID`);
CREATE INDEX `tblEvaluee_Other_Referral_Sources_Evaluee_Rating_ID_idx` ON `tblEvaluee_Other_Referral_Sources` (`Evaluee_Other_Clients_ID`);
CREATE INDEX `tblEvaluee_Other_Referral_Sources_Sequence_idx` ON `tblEvaluee_Other_Referral_Sources` (`Sort_Order`);

CREATE TABLE `tblEvaluee_Post_ECLR_Summary`
 (
	`PersonID`			INTEGER, 
	`Max_VQ`			REAL, 
	`Avg_VQ`			REAL, 
	`Min_VQ`			REAL, 
	`POMean`			REAL, 
	`PO10`			REAL, 
	`PO25`			REAL, 
	`POMedian`			REAL, 
	`PO75`			REAL, 
	`PO90`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_ECLR_Summary_PersonID_idx` ON `tblEvaluee_Post_ECLR_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Post_Job_Summary`
 (
	`PersonID`			INTEGER, 
	`SumOfPO00`			REAL, 
	`SumOfPO01`			REAL, 
	`SumOfPO02`			REAL, 
	`SumOfPO03`			REAL, 
	`SumOfPO04`			REAL, 
	`SumOfPO05`			REAL, 
	`SumOfPO06`			REAL, 
	`SumOfPO07`			REAL, 
	`SumOfPO08`			REAL, 
	`SumOfPO09`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_Job_Summary_PersonID_idx` ON `tblEvaluee_Post_Job_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Post_TCP_Levels`
 (
	`PersonID`			INTEGER, 
	`Dot_Code`			varchar, 
	`TSP80`			INTEGER, 
	`TSP60`			INTEGER, 
	`TSP40`			INTEGER, 
	`TSP20`			INTEGER, 
	`TSP0`			INTEGER
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_TCP_Levels_Dot_Code_idx` ON `tblEvaluee_Post_TCP_Levels` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Post_TCP_Levels_PersonID_idx` ON `tblEvaluee_Post_TCP_Levels` (`PersonID`);

CREATE TABLE `tblEvaluee_Post_TCP_Summary`
 (
	`PersonID`			INTEGER, 
	`TSP80`			REAL, 
	`TSP60`			REAL, 
	`TSP40`			REAL, 
	`TSP20`			REAL, 
	`TSP0`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_TCP_Summary_PersonID_idx` ON `tblEvaluee_Post_TCP_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Post_Value_Variance`
 (
	`PersonID`			INTEGER, 
	`Dot_Code`			varchar, 
	`V01`			REAL, 
	`V02`			REAL, 
	`V03`			REAL, 
	`V04`			REAL, 
	`V05`			REAL, 
	`V06`			REAL, 
	`V07`			REAL, 
	`V08`			REAL, 
	`V09`			REAL, 
	`V10`			REAL, 
	`V11`			REAL, 
	`V12`			REAL, 
	`V13`			REAL, 
	`V14`			REAL, 
	`V15`			REAL, 
	`V16`			REAL, 
	`V17`			REAL, 
	`V18`			REAL, 
	`V19`			REAL, 
	`V20`			REAL, 
	`V21`			REAL, 
	`TotalVV`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_Value_Variance_Dot_Code_idx` ON `tblEvaluee_Post_Value_Variance` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Post_Value_Variance_PersonID_idx` ON `tblEvaluee_Post_Value_Variance` (`PersonID`);

CREATE TABLE `tblEvaluee_Pre_ECLR`
 (
	`PersonID`			INTEGER, 
	`Dot_Code`			varchar, 
	`MVQ`			REAL, 
	`AVQ`			REAL, 
	`NVQ`			REAL, 
	`PostMean`			REAL, 
	`Post10`			REAL, 
	`Post25`			REAL, 
	`PostMedian`			REAL, 
	`Post75`			REAL, 
	`Post90`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Pre_ECLR_Dot_Code_idx` ON `tblEvaluee_Pre_ECLR` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Pre_ECLR_PersonID_idx` ON `tblEvaluee_Pre_ECLR` (`PersonID`);

CREATE TABLE `tblEvaluee_Pre_ECLR_Summary`
 (
	`PersonID`			INTEGER, 
	`Max_VQ`			REAL, 
	`Avg_VQ`			REAL, 
	`Min_VQ`			REAL, 
	`POMean`			REAL, 
	`PO10`			REAL, 
	`PO25`			REAL, 
	`POMedian`			REAL, 
	`PO75`			REAL, 
	`PO90`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Pre_ECLR_Summary_PersonID_idx` ON `tblEvaluee_Pre_ECLR_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Pre_Job_Summary`
 (
	`PersonID`			INTEGER, 
	`SumOfPO00`			REAL, 
	`SumOfPO01`			REAL, 
	`SumOfPO02`			REAL, 
	`SumOfPO03`			REAL, 
	`SumOfPO04`			REAL, 
	`SumOfPO05`			REAL, 
	`SumOfPO06`			REAL, 
	`SumOfPO07`			REAL, 
	`SumOfPO08`			REAL, 
	`SumOfPO09`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Pre_Job_Summary_PersonID_idx` ON `tblEvaluee_Pre_Job_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Pre_Jobs`
 (
	`PersonID`			INTEGER, 
	`CountryID`			INTEGER, 
	`CountyNumber`			INTEGER, 
	`State`			varchar, 
	`Title`			varchar, 
	`Dot_Code`			varchar, 
	`PO00`			INTEGER, 
	`PO01`			INTEGER, 
	`PO02`			INTEGER, 
	`PO03`			INTEGER, 
	`PO04`			INTEGER, 
	`PO05`			INTEGER, 
	`PO06`			INTEGER, 
	`PO07`			INTEGER, 
	`PO08`			INTEGER, 
	`PO09`			INTEGER, 
	`VQ`			REAL, 
	`ONETCODE`			varchar, 
	`Oucode`			varchar, 
	`JOBCAT`			varchar, 
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
	`Cen`			varchar, 
	`GEDR1`			INTEGER, 
	`GEDM1`			INTEGER, 
	`GEDL1`			INTEGER, 
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
	`TSP`			INTEGER, 
	`Sort_Order`			INTEGER
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Pre_Jobs_CountryID_idx` ON `tblEvaluee_Pre_Jobs` (`CountryID`);
CREATE INDEX `tblEvaluee_Pre_Jobs_Dot_Code_idx` ON `tblEvaluee_Pre_Jobs` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Pre_Jobs_ONETCODE_idx` ON `tblEvaluee_Pre_Jobs` (`ONETCODE`);
CREATE INDEX `tblEvaluee_Pre_Jobs_Oucode_idx` ON `tblEvaluee_Pre_Jobs` (`Oucode`);
CREATE INDEX `tblEvaluee_Pre_Jobs_PersonID_idx` ON `tblEvaluee_Pre_Jobs` (`PersonID`);

CREATE TABLE `tblEvaluee_Pre_TCP_Summary`
 (
	`PersonID`			INTEGER, 
	`TSP80`			REAL, 
	`TSP60`			REAL, 
	`TSP40`			REAL, 
	`TSP20`			REAL, 
	`TSP0`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Pre_TCP_Summary_PersonID_idx` ON `tblEvaluee_Pre_TCP_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Profile_Master`
 (
	`PersonID`			INTEGER, 
	`Evaluee_Profile_Master_ID`			INTEGER, 
	`Reasoning`			INTEGER, 
	`Math`			INTEGER, 
	`Language`			INTEGER, 
	`Spatial`			INTEGER, 
	`Form`			INTEGER, 
	`Clerical`			INTEGER, 
	`Motor`			INTEGER, 
	`Finger`			INTEGER, 
	`Manual`			INTEGER, 
	`Eye-Hand-Foot`			INTEGER, 
	`Color`			INTEGER, 
	`Strength`			INTEGER, 
	`Climb_Balance`			INTEGER, 
	`Stoop_Kneel`			INTEGER, 
	`Reach_Handle`			INTEGER, 
	`Talk_Hear`			INTEGER, 
	`See`			INTEGER, 
	`Out_In_Both`			INTEGER, 
	`Cold`			INTEGER, 
	`Heat`			INTEGER, 
	`Wet`			INTEGER, 
	`Vibrations`			INTEGER, 
	`Hazards`			INTEGER, 
	`VQ`			REAL, 
	`Dust_Fumes`			INTEGER, 
	`Achievement`			REAL, 
	`WorkingConditions`			REAL, 
	`Recognition`			REAL, 
	`Relationships`			REAL, 
	`Support`			REAL, 
	`Independence`			REAL, 
	`ProfileTitle`			varchar, 
	`EReasoning`			INTEGER, 
	`EMath`			INTEGER, 
	`ELanguage`			INTEGER, 
	`ESpatial`			INTEGER, 
	`EForm`			INTEGER, 
	`EClerical`			INTEGER, 
	`EMotor`			INTEGER, 
	`EFinger`			INTEGER, 
	`EManual`			INTEGER, 
	`EEye-Hand-Foot`			INTEGER, 
	`EColor`			INTEGER, 
	`EStrength`			INTEGER, 
	`EClimb_Balance`			INTEGER, 
	`EStoop_Kneel`			INTEGER, 
	`EReach_Handle`			INTEGER, 
	`ETalk_Hear`			INTEGER, 
	`ESee`			INTEGER, 
	`EOut_In_Both`			INTEGER, 
	`ECold`			INTEGER, 
	`EHeat`			INTEGER, 
	`EWet`			INTEGER, 
	`EVibrations`			INTEGER, 
	`EHazards`			INTEGER, 
	`EDust_Fumes`			INTEGER, 
	`EProfileTitle`			varchar, 
	`EVQ`			REAL, 
	`PRReasoning`			INTEGER, 
	`PRMath`			INTEGER, 
	`PRLanguage`			INTEGER, 
	`PRSpatial`			INTEGER, 
	`PRForm`			INTEGER, 
	`PRClerical`			INTEGER, 
	`PRMotor`			INTEGER, 
	`PRFinger`			INTEGER, 
	`PRManual`			INTEGER, 
	`PREye-Hand-Foot`			INTEGER, 
	`PRColor`			INTEGER, 
	`PRStrength`			INTEGER, 
	`PRClimb_Balance`			INTEGER, 
	`PRStoop_Kneel`			INTEGER, 
	`PRReach_Handle`			INTEGER, 
	`PRTalk_Hear`			INTEGER, 
	`PRSee`			INTEGER, 
	`PROut_In_Both`			INTEGER, 
	`PRCold`			INTEGER, 
	`PRHeat`			INTEGER, 
	`PRWet`			INTEGER, 
	`PRVibrations`			INTEGER, 
	`PRHazards`			INTEGER, 
	`PRDust_Fumes`			INTEGER, 
	`PRProfileTitle`			varchar, 
	`PRVQ`			REAL, 
	`POReasoning`			INTEGER, 
	`POMath`			INTEGER, 
	`POLanguage`			INTEGER, 
	`POSpatial`			INTEGER, 
	`POForm`			INTEGER, 
	`POClerical`			INTEGER, 
	`POMotor`			INTEGER, 
	`POFinger`			INTEGER, 
	`POManual`			INTEGER, 
	`POEye-Hand-Foot`			INTEGER, 
	`POColor`			INTEGER, 
	`POStrength`			INTEGER, 
	`POClimb_Balance`			INTEGER, 
	`POStoop_Kneel`			INTEGER, 
	`POReach_Handle`			INTEGER, 
	`POTalk_Hear`			INTEGER, 
	`POSee`			INTEGER, 
	`POOut_In_Both`			INTEGER, 
	`POCold`			INTEGER, 
	`POHeat`			INTEGER, 
	`POWet`			INTEGER, 
	`POVibrations`			INTEGER, 
	`POHazards`			INTEGER, 
	`PODust_Fumes`			INTEGER, 
	`POProfileTitle`			varchar, 
	`POVQ`			REAL, 
	`GFactor`			varchar, 
	`PRGFactor`			varchar, 
	`POGFactor`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Profile_Master_PersonID_idx` ON `tblEvaluee_Profile_Master` (`PersonID`);
CREATE INDEX `tblEvaluee_Profile_Master_ProfileID_idx` ON `tblEvaluee_Profile_Master` (`Evaluee_Profile_Master_ID`);

CREATE TABLE `tblEvaluee_Profiles`
 (
	`PersonID`			INTEGER, 
	`Evaluee_Profile_ID`			INTEGER, 
	`Reasoning`			REAL, 
	`Math`			REAL, 
	`Language`			REAL, 
	`Spatial`			REAL, 
	`Form`			REAL, 
	`Clerical`			REAL, 
	`Motor`			REAL, 
	`Finger`			REAL, 
	`Manual`			REAL, 
	`Eye-Hand-Foot`			REAL, 
	`Color`			REAL, 
	`Strength`			REAL, 
	`Climb_Balance`			REAL, 
	`Stoop_Kneel`			REAL, 
	`Reach_Handle`			REAL, 
	`Talk_Hear`			REAL, 
	`See`			REAL, 
	`Out_In_Both`			REAL, 
	`Cold`			REAL, 
	`Heat`			REAL, 
	`Wet`			REAL, 
	`Vibrations`			REAL, 
	`Hazards`			REAL, 
	`Dust_Fumes`			REAL, 
	`Achievement`			REAL, 
	`WorkingConditions`			REAL, 
	`Recognition`			REAL, 
	`Relationships`			REAL, 
	`Support`			REAL, 
	`Independence`			REAL, 
	`ProfileTitle`			varchar, 
	`ProfileID_CONV`			INTEGER, 
	`Sort_Order`			INTEGER, 
	`VQ`			REAL
	, PRIMARY KEY (`Evaluee_Profile_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Profiles_ClientID_idx` ON `tblEvaluee_Profiles` (`PersonID`);
CREATE INDEX `tblEvaluee_Profiles_Evaluee_Job_Profile_ID_idx` ON `tblEvaluee_Profiles` (`Evaluee_Profile_ID`);
CREATE INDEX `tblEvaluee_Profiles_ProfileID_idx` ON `tblEvaluee_Profiles` (`ProfileID_CONV`);

CREATE TABLE `tblEvaluee_Ratings`
 (
	`PersonID`			INTEGER, 
	`Evaluee_Rating_ID`			INTEGER, 
	`RatingID`			INTEGER, 
	`RatingName`			varchar, 
	`VariableNumber`			varchar, 
	`Guidelines`			varchar, 
	`Score`			REAL, 
	`Score_Level_Description`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Evaluee_Rating_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Ratings_ClientID_idx` ON `tblEvaluee_Ratings` (`PersonID`);
CREATE INDEX `tblEvaluee_Ratings_Evaluee_Rating_ID_idx` ON `tblEvaluee_Ratings` (`Evaluee_Rating_ID`);
CREATE INDEX `tblEvaluee_Ratings_RatingDescriptionID_idx` ON `tblEvaluee_Ratings` (`RatingID`);
CREATE INDEX `tblEvaluee_Ratings_Sequence_idx` ON `tblEvaluee_Ratings` (`Sort_Order`);

CREATE TABLE `tblEvaluee_Ratings_SUMMARY`
 (
	`PersonID`			INTEGER, 
	`VariableNumber`			varchar, 
	`Rating`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Ratings_SUMMARY_PersonID_idx` ON `tblEvaluee_Ratings_SUMMARY` (`PersonID`);

CREATE TABLE `tblEvaluee_Statistics`
 (
	`PersonID`			INTEGER NOT NULL, 
	`CountryID`			INTEGER, 
	`StateID`			INTEGER, 
	`CountyNumber`			INTEGER, 
	`State`			varchar, 
	`Evaluee_Statistics_ID`			INTEGER, 
	`JobCount`			INTEGER, 
	`PreJobMatch0`			INTEGER, 
	`PreJobMatch1`			INTEGER, 
	`PreJobMatch2`			INTEGER, 
	`PreJobMatch3`			INTEGER, 
	`PreJobMatch4`			INTEGER, 
	`PreJobMatch5`			INTEGER, 
	`PreJobMatch6`			INTEGER, 
	`PreJobMatch7`			INTEGER, 
	`PreJobMatch8`			INTEGER, 
	`PreJobMatch9`			INTEGER, 
	`PreTotalJobMatch`			INTEGER, 
	`PostJobMatch0`			INTEGER, 
	`PostJobMatch1`			INTEGER, 
	`PostJobMatch2`			INTEGER, 
	`PostJobMatch3`			INTEGER, 
	`PostJobMatch4`			INTEGER, 
	`PostJobMatch5`			INTEGER, 
	`PostJobMatch6`			INTEGER, 
	`PostJobMatch7`			INTEGER, 
	`PostJobMatch8`			INTEGER, 
	`PostJobMatch9`			INTEGER, 
	`PostTotalJobMatch`			INTEGER, 
	`PreMaxVQ`			REAL, 
	`PreAvgVQ`			REAL, 
	`PreMinVQ`			REAL, 
	`PostMaxVQ`			REAL, 
	`PostAvgVQ`			REAL, 
	`PostMinVQ`			REAL, 
	`PreECLRMean`			REAL, 
	`PreECLR10`			REAL, 
	`PreECLR25`			REAL, 
	`PreECLRMedian`			REAL, 
	`PreECLR75`			REAL, 
	`PreECLR90`			REAL, 
	`PostECLRMean`			REAL, 
	`PostECLR10`			REAL, 
	`PostECLR25`			REAL, 
	`PostECLRMedian`			REAL, 
	`PostECLR75`			REAL, 
	`PostECLR90`			REAL, 
	`PreTSP4`			INTEGER, 
	`PreTSP3`			INTEGER, 
	`PreTSP2`			INTEGER, 
	`PreTSP1`			INTEGER, 
	`PreTSP0`			INTEGER, 
	`PostTSP4`			INTEGER, 
	`PostTSP3`			INTEGER, 
	`PostTSP2`			INTEGER, 
	`PostTSP1`			INTEGER, 
	`PostTSP0`			INTEGER, 
	`PreUtilization`			REAL, 
	`PostUtilization`			REAL, 
	`JobBankMaxVQ`			REAL, 
	`JobBankMinVQ`			REAL, 
	`TSPNumber`			INTEGER
	, PRIMARY KEY (`Evaluee_Statistics_ID`)
);

-- CREATE INDEXES ...
CREATE UNIQUE INDEX `tblEvaluee_Statistics_ClientID_idx` ON `tblEvaluee_Statistics` (`PersonID`);
CREATE INDEX `tblEvaluee_Statistics_CountryID_idx` ON `tblEvaluee_Statistics` (`CountryID`);
CREATE INDEX `tblEvaluee_Statistics_CountyNumber_idx` ON `tblEvaluee_Statistics` (`CountyNumber`);
CREATE INDEX `tblEvaluee_Statistics_Evaluee_Statistics_ID_idx` ON `tblEvaluee_Statistics` (`Evaluee_Statistics_ID`);
CREATE INDEX `tblEvaluee_Statistics_State_idx` ON `tblEvaluee_Statistics` (`State`);
CREATE INDEX `tblEvaluee_Statistics_StateID_idx` ON `tblEvaluee_Statistics` (`StateID`);

CREATE TABLE `tblEvaluee_Test_Results`
 (
	`PersonID`			INTEGER, 
	`TestCategoryID`			INTEGER, 
	`TestID`			INTEGER, 
	`Evaluee_Test_Result_ID`			INTEGER, 
	`Percentile`			REAL, 
	`Standard`			REAL, 
	`SUBTEST`			varchar, 
	`GED`			varchar, 
	`APTITUDES`			varchar, 
	`GEDR1`			INTEGER NOT NULL, 
	`GEDM1`			INTEGER NOT NULL, 
	`GEDL1`			INTEGER NOT NULL, 
	`APTG1`			INTEGER NOT NULL, 
	`APTV1`			INTEGER NOT NULL, 
	`APTN1`			INTEGER NOT NULL, 
	`APTS1`			INTEGER NOT NULL, 
	`APTP1`			INTEGER NOT NULL, 
	`APTQ1`			INTEGER NOT NULL, 
	`APTK1`			INTEGER NOT NULL, 
	`APTF1`			INTEGER NOT NULL, 
	`APTM1`			INTEGER NOT NULL, 
	`APTE1`			INTEGER NOT NULL, 
	`APTC1`			INTEGER NOT NULL, 
	`SelectThisTest`			INTEGER NOT NULL, 
	`GEDR1Score`			REAL, 
	`GEDM1Score`			REAL, 
	`GEDL1Score`			REAL, 
	`APTG1Score`			REAL, 
	`APTV1Score`			REAL, 
	`APTN1Score`			REAL, 
	`APTS1Score`			REAL, 
	`APTP1Score`			REAL, 
	`APTQ1Score`			REAL, 
	`APTK1Score`			REAL, 
	`APTF1Score`			REAL, 
	`APTM1Score`			REAL, 
	`APTE1Score`			REAL, 
	`APTC1Score`			REAL, 
	`GEDEffect`			REAL, 
	`APTEffect`			REAL, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Evaluee_Test_Result_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Test_Results_BatteryID_idx` ON `tblEvaluee_Test_Results` (`TestID`);
CREATE INDEX `tblEvaluee_Test_Results_ClientID_idx` ON `tblEvaluee_Test_Results` (`PersonID`);
CREATE INDEX `tblEvaluee_Test_Results_Evaluee_Test_Result_ID_idx` ON `tblEvaluee_Test_Results` (`Evaluee_Test_Result_ID`);
CREATE INDEX `tblEvaluee_Test_Results_Standard_idx` ON `tblEvaluee_Test_Results` (`Standard`);
CREATE INDEX `tblEvaluee_Test_Results_TestCategoryID_idx` ON `tblEvaluee_Test_Results` (`TestCategoryID`);

CREATE TABLE `tblEvaluee_Test_Score_Effects`
 (
	`PersonID`			INTEGER, 
	`GEDR1_Effect`			REAL, 
	`GEDM1_Effect`			REAL, 
	`GEDL1_Effect`			REAL, 
	`APTG1_Effect`			REAL, 
	`APTV1_Effect`			REAL, 
	`APTN1_Effect`			REAL, 
	`APTS1_Effect`			REAL, 
	`APTP1_Effect`			REAL, 
	`APTQ1_Effect`			REAL, 
	`APTK1_Effect`			REAL, 
	`APTF1_Effect`			REAL, 
	`APTM1_Effect`			REAL, 
	`APTE1_Effect`			REAL, 
	`APTC1_Effect`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Test_Score_Effects_PersonID_idx` ON `tblEvaluee_Test_Score_Effects` (`PersonID`);

CREATE TABLE `tblEvaluee_Values`
 (
	`PersonID`			INTEGER, 
	`Evaluee_Value_ID`			INTEGER, 
	`ValueCategoryID`			INTEGER, 
	`ValueID`			INTEGER, 
	`Score`			INTEGER, 
	`Score_Label`			varchar, 
	`DESIRE`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Evaluee_Value_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Values_ClientID_idx` ON `tblEvaluee_Values` (`PersonID`);
CREATE INDEX `tblEvaluee_Values_Evaluee_Rating_ID_idx` ON `tblEvaluee_Values` (`Evaluee_Value_ID`);
CREATE INDEX `tblEvaluee_Values_RatingDescriptionID_idx` ON `tblEvaluee_Values` (`ValueID`);
CREATE INDEX `tblEvaluee_Values_Sequence_idx` ON `tblEvaluee_Values` (`Sort_Order`);
CREATE INDEX `tblEvaluee_Values_ValueCategoryID_idx` ON `tblEvaluee_Values` (`ValueCategoryID`);

CREATE TABLE `tblEvaluee_VIPR_Letters`
 (
	`PersonID`			INTEGER, 
	`Pos1`			varchar, 
	`Pos2`			varchar, 
	`Pos3`			varchar, 
	`Pos4`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_VIPR_Letters_PersonID_idx` ON `tblEvaluee_VIPR_Letters` (`PersonID`);

CREATE TABLE `tblEvaluee_VIPR_SUMMARY`
 (
	`PersonID`			INTEGER, 
	`EScore`			REAL, 
	`IScore`			REAL, 
	`Sscore`			REAL, 
	`NScore`			REAL, 
	`Tscore`			REAL, 
	`FScore`			REAL, 
	`JScore`			REAL, 
	`PScore`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_VIPR_SUMMARY_PersonID_idx` ON `tblEvaluee_VIPR_SUMMARY` (`PersonID`);

CREATE TABLE `tblEvaluee_VIPR_Test_Pairs`
 (
	`PersonID`			INTEGER, 
	`Evaluee_VIPR_Test_Pairs_ID`			INTEGER, 
	`TestNumber`			INTEGER, 
	`DOTCODE1`			varchar, 
	`Title1`			varchar, 
	`DOTCODE2`			varchar, 
	`Title2`			varchar, 
	`Selection`			INTEGER, 
	`Indicator1`			varchar, 
	`Indicator2`			varchar, 
	`EScore`			varchar, 
	`IScore`			varchar, 
	`Sscore`			varchar, 
	`NScore`			varchar, 
	`Tscore`			varchar, 
	`FScore`			varchar, 
	`JScore`			varchar, 
	`PScore`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Evaluee_VIPR_Test_Pairs_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_VIPR_Test_Pairs_ClientID_idx` ON `tblEvaluee_VIPR_Test_Pairs` (`PersonID`);
CREATE UNIQUE INDEX `tblEvaluee_VIPR_Test_Pairs_Evaluee_Test_Result_ID_idx` ON `tblEvaluee_VIPR_Test_Pairs` (`Evaluee_VIPR_Test_Pairs_ID`);

CREATE TABLE `tblEvaluee_Work_History`
 (
	`PersonID`			INTEGER, 
	`V01`			REAL, 
	`V02`			REAL, 
	`V03`			REAL, 
	`V04`			REAL, 
	`V05`			REAL, 
	`V06`			REAL, 
	`V07`			REAL, 
	`V08`			REAL, 
	`V09`			REAL, 
	`V10`			REAL, 
	`V11`			REAL, 
	`V12`			REAL, 
	`V13`			REAL, 
	`V14`			REAL, 
	`V15`			REAL, 
	`V16`			REAL, 
	`V17`			REAL, 
	`V18`			REAL, 
	`V19`			REAL, 
	`V20`			REAL, 
	`V21`			REAL, 
	`Sort_Order`			INTEGER
);

-- CREATE INDEXES ...

CREATE TABLE `tblEvaluee_Work_History_ECLR`
 (
	`PersonID`			INTEGER, 
	`WH_EC_Person_Dot_Code_ID`			INTEGER, 
	`Dot_Code`			varchar, 
	`MVQ`			REAL, 
	`AVQ`			REAL, 
	`NVQ`			REAL, 
	`PostMean`			REAL, 
	`Post10`			REAL, 
	`Post25`			REAL, 
	`PostMedian`			REAL, 
	`Post75`			REAL, 
	`Post90`			REAL
	, PRIMARY KEY (`WH_EC_Person_Dot_Code_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Work_History_ECLR_Dot_Code_idx` ON `tblEvaluee_Work_History_ECLR` (`Dot_Code`);
CREATE UNIQUE INDEX `tblEvaluee_Work_History_ECLR_Person_Dot_Code_ID_idx` ON `tblEvaluee_Work_History_ECLR` (`WH_EC_Person_Dot_Code_ID`);
CREATE INDEX `tblEvaluee_Work_History_ECLR_PersonID_idx` ON `tblEvaluee_Work_History_ECLR` (`PersonID`);

CREATE TABLE `tblEvaluee_Work_History_Profile`
 (
	`PersonID`			INTEGER, 
	`Evaluee_WH_ProfileID`			INTEGER, 
	`Reasoning`			REAL, 
	`Math`			REAL, 
	`Language`			REAL, 
	`Spatial`			REAL, 
	`Form`			REAL, 
	`Clerical`			REAL, 
	`Motor`			REAL, 
	`Finger`			REAL, 
	`Manual`			REAL, 
	`Eye-Hand-Foot`			REAL, 
	`Color`			REAL, 
	`Strength`			REAL, 
	`Climb_Balance`			REAL, 
	`Stoop_Kneel`			REAL, 
	`Reach_Handle`			REAL, 
	`Talk_Hear`			REAL, 
	`See`			REAL, 
	`Out_In_Both`			REAL, 
	`Cold`			REAL, 
	`Heat`			REAL, 
	`Wet`			REAL, 
	`Vibrations`			REAL, 
	`Hazards`			REAL, 
	`Dust_Fumes`			REAL, 
	`Achievement`			REAL, 
	`WorkingConditions`			REAL, 
	`Recognition`			REAL, 
	`Relationships`			REAL, 
	`Support`			REAL, 
	`Independence`			REAL, 
	`ProfileTitle`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Evaluee_WH_ProfileID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Work_History_Profile_ClientID_idx` ON `tblEvaluee_Work_History_Profile` (`PersonID`);
CREATE INDEX `tblEvaluee_Work_History_Profile_ProfileID_idx` ON `tblEvaluee_Work_History_Profile` (`Evaluee_WH_ProfileID`);

CREATE TABLE `tblEvaluee_Work_History_Value_Variance`
 (
	`PersonID`			INTEGER, 
	`Person_Dot_Code_ID`			INTEGER, 
	`Dot_Code`			varchar, 
	`V01`			REAL, 
	`V02`			REAL, 
	`V03`			REAL, 
	`V04`			REAL, 
	`V05`			REAL, 
	`V06`			REAL, 
	`V07`			REAL, 
	`V08`			REAL, 
	`V09`			REAL, 
	`V10`			REAL, 
	`V11`			REAL, 
	`V12`			REAL, 
	`V13`			REAL, 
	`V14`			REAL, 
	`V15`			REAL, 
	`V16`			REAL, 
	`V17`			REAL, 
	`V18`			REAL, 
	`V19`			REAL, 
	`V20`			REAL, 
	`V21`			REAL, 
	`TotalVV`			REAL
	, PRIMARY KEY (`Person_Dot_Code_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Work_History_Value_Variance_Dot_Code_idx` ON `tblEvaluee_Work_History_Value_Variance` (`Dot_Code`);
CREATE UNIQUE INDEX `tblEvaluee_Work_History_Value_Variance_Person_Dot_Code_ID_idx` ON `tblEvaluee_Work_History_Value_Variance` (`Person_Dot_Code_ID`);
CREATE INDEX `tblEvaluee_Work_History_Value_Variance_PersonID_idx` ON `tblEvaluee_Work_History_Value_Variance` (`PersonID`);

CREATE TABLE `tblIMPORT_BLS_2018_SOC_Definitions`
 (
	`SOC Group`			varchar, 
	`SOC Code`			varchar, 
	`SOC Title`			varchar, 
	`SOC Definition`			TEXT, 
	`Import_File_Source`			varchar, 
	`Import_Date`			DateTime
);

-- CREATE INDEXES ...
CREATE INDEX `tblIMPORT_BLS_2018_SOC_Definitions_SOC Code_idx` ON `tblIMPORT_BLS_2018_SOC_Definitions` (`SOC Code`);

CREATE TABLE `tblIMPORT_BLS_SOC_Matches`
 (
	`2018 SOC Code`			varchar, 
	`2018 SOC Title`			varchar, 
	`2018 SOC Direct Match Title`			varchar, 
	`Illustrative Example`			varchar, 
	`Import_File_Source`			varchar, 
	`Import_Date`			DateTime
);

-- CREATE INDEXES ...
CREATE INDEX `tblIMPORT_BLS_SOC_Matches_2018 SOC Code_idx` ON `tblIMPORT_BLS_SOC_Matches` (`2018 SOC Code`);

CREATE TABLE `tblIMPORT_Dr_Dennis_DOT_VQs_EQs`
 (
	`DOT_Code`			varchar, 
	`DOT_Title`			varchar, 
	`Field3`			varchar, 
	`Field4`			varchar, 
	`Field5`			varchar, 
	`VQ`			varchar, 
	`EQ`			varchar, 
	`Import_File_Source`			varchar, 
	`Import_Date`			DateTime
);

-- CREATE INDEXES ...
CREATE INDEX `tblIMPORT_Dr_Dennis_DOT_VQs_EQs_DOT_Code_idx` ON `tblIMPORT_Dr_Dennis_DOT_VQs_EQs` (`DOT_Code`);

CREATE TABLE `tblIMPORT_Dr_Dennis_Pop_Works_101320`
 (
	`DOT_CODE`			varchar, 
	`Pop_Work_Job_Count`			REAL, 
	`Import_File_Source`			varchar, 
	`Import_Date`			DateTime
);

-- CREATE INDEXES ...
CREATE INDEX `tblIMPORT_Dr_Dennis_Pop_Works_101320_DOT_CODE_idx` ON `tblIMPORT_Dr_Dennis_Pop_Works_101320` (`DOT_CODE`);

CREATE TABLE `tblIMPORT_USBLS_OES_State_M2019_dl`
 (
	`area`			varchar, 
	`area_title`			varchar, 
	`area_type`			varchar, 
	`naics`			varchar, 
	`naics_title`			varchar, 
	`i_group`			varchar, 
	`own_code`			varchar, 
	`occ_code`			varchar, 
	`occ_title`			varchar, 
	`o_group`			varchar, 
	`tot_emp`			INTEGER, 
	`emp_prse`			varchar, 
	`jobs_1000`			varchar, 
	`loc_quotient`			varchar, 
	`pct_total`			varchar, 
	`h_mean`			REAL, 
	`a_mean`			REAL, 
	`mean_prse`			varchar, 
	`h_pct10`			varchar, 
	`h_pct25`			varchar, 
	`h_median`			varchar, 
	`h_pct75`			varchar, 
	`h_pct90`			varchar, 
	`a_pct10`			varchar, 
	`a_pct25`			varchar, 
	`a_median`			varchar, 
	`a_pct75`			varchar, 
	`a_pct90`			varchar, 
	`annual`			varchar, 
	`hourly`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblIMPORT_USBLS_OES_State_M2019_dl_occ_code_idx` ON `tblIMPORT_USBLS_OES_State_M2019_dl` (`occ_code`);
CREATE INDEX `tblIMPORT_USBLS_OES_State_M2019_dl_own_code_idx` ON `tblIMPORT_USBLS_OES_State_M2019_dl` (`own_code`);

CREATE TABLE `tblLinks`
 (
	`LinkID`			INTEGER, 
	`Link_Description`			varchar, 
	`Link`			TEXT
	, PRIMARY KEY (`LinkID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblLinks_LinkID_idx` ON `tblLinks` (`LinkID`);

CREATE TABLE `tblPeople`
 (
	`ClientID`			INTEGER, 
	`PersonType`			varchar, 
	`PersonID`			INTEGER, 
	`FirstName`			varchar, 
	`MiddleName`			varchar, 
	`LastName`			varchar, 
	`Address_Line_1`			varchar, 
	`Address_Line_2`			varchar, 
	`City`			varchar, 
	`State`			varchar, 
	`Zip`			varchar, 
	`County`			varchar, 
	`Country`			varchar, 
	`Email`			varchar, 
	`Email_for_Claims`			varchar, 
	`Cell_Phone`			varchar, 
	`Work_Phone`			varchar, 
	`Home_Phone`			varchar, 
	`Title`			varchar, 
	`Reason_for_Referral`			varchar, 
	`Case_Diagnosis`			varchar, 
	`Case_Name`			varchar, 
	`Case_Notes`			TEXT, 
	`PersonNotes`			TEXT, 
	`Work_Country`			varchar, 
	`Work_State`			varchar, 
	`Work_County`			varchar, 
	`Evalulation_Year`			INTEGER, 
	`ECLR_Rate`			REAL, 
	`Inflation_Rate`			REAL, 
	`Personality_Type`			varchar, 
	`Personality_Name`			varchar, 
	`Vagen01m`			INTEGER, 
	`Vagen02m`			INTEGER, 
	`Vagen03m`			INTEGER, 
	`Vagen04m`			INTEGER, 
	`Vagen05m`			INTEGER, 
	`Vagen06m`			INTEGER, 
	`V01en00m`			INTEGER, 
	`V02en00m`			INTEGER, 
	`V03en00m`			INTEGER, 
	`V04en00m`			INTEGER, 
	`V05en00m`			INTEGER, 
	`V06en00m`			INTEGER, 
	`V07en00m`			INTEGER, 
	`V08en00m`			INTEGER, 
	`V09en00m`			INTEGER, 
	`V10en00m`			INTEGER, 
	`V11en00m`			INTEGER, 
	`V12en00m`			INTEGER, 
	`V13en00m`			INTEGER, 
	`V14en00m`			INTEGER, 
	`V15en00m`			INTEGER, 
	`V16en00m`			INTEGER, 
	`V17en00m`			INTEGER, 
	`V18en00m`			INTEGER, 
	`V19en00m`			INTEGER, 
	`V20en00m`			INTEGER, 
	`V21en00m`			INTEGER, 
	`Person_Folder`			varchar
	, PRIMARY KEY (`PersonID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblPeople_CompanyID_idx` ON `tblPeople` (`ClientID`);
CREATE UNIQUE INDEX `tblPeople_CompanyLocationID_idx` ON `tblPeople` (`PersonID`);

CREATE TABLE `tblPeople_Phones`
 (
	`PersonID`			INTEGER NOT NULL, 
	`PhoneID`			INTEGER, 
	`PhoneDescriptionID`			INTEGER, 
	`PhoneNumber`			varchar, 
	`PhoneExtension`			varchar, 
	`PhoneRank`			INTEGER, 
	`PhoneNotes`			TEXT
	, PRIMARY KEY (`PhoneID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblPeople_Phones_CaseID_idx` ON `tblPeople_Phones` (`PersonID`);
CREATE INDEX `tblPeople_Phones_CasePhoneID_idx` ON `tblPeople_Phones` (`PhoneID`);
CREATE INDEX `tblPeople_Phones_PhoneDescriptionID_idx` ON `tblPeople_Phones` (`PhoneDescriptionID`);
CREATE INDEX `tblPeople_Phones_PhoneRank_idx` ON `tblPeople_Phones` (`PhoneRank`);

CREATE TABLE `tblSystem_CompactDate_DataDatabase`
 (
	`Compact Date`			DateTime
);

-- CREATE INDEXES ...

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

CREATE TABLE `tblSystem_EstimateTypes`
 (
	`EstimateType`			varchar NOT NULL, 
	`EstimateTypeDescription`			varchar, 
	`EstimateHours`			INTEGER, 
	`SortCode`			INTEGER
	, PRIMARY KEY (`EstimateType`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblSystem_EstimateTypes_SortCode_idx` ON `tblSystem_EstimateTypes` (`SortCode`);

CREATE TABLE `tblSystem_Issues`
 (
	`IssueID`			INTEGER, 
	`PriorityCode`			varchar, 
	`IssueDescription`			TEXT, 
	`IssueObject`			varchar, 
	`IssuerID`			INTEGER, 
	`IssueDate`			DateTime, 
	`AssignedToID`			INTEGER, 
	`ResolutionNotes`			TEXT, 
	`EstimateType`			varchar, 
	`EstimateHoursAmount`			REAL, 
	`ResolutionDate`			DateTime, 
	`Implemented_in_AppVersion`			varchar, 
	`UserAcceptedResolutionID`			INTEGER, 
	`UserAcceptedDate`			DateTime
	, PRIMARY KEY (`IssueID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblSystem_Issues_AssignedToID_idx` ON `tblSystem_Issues` (`AssignedToID`);
CREATE INDEX `tblSystem_Issues_Implemented_in_AppVersion_idx` ON `tblSystem_Issues` (`Implemented_in_AppVersion`);
CREATE INDEX `tblSystem_Issues_IssuerID_idx` ON `tblSystem_Issues` (`IssuerID`);
CREATE INDEX `tblSystem_Issues_PriorityCode_idx` ON `tblSystem_Issues` (`PriorityCode`);
CREATE INDEX `tblSystem_Issues_UserAcceptedResolutionID_idx` ON `tblSystem_Issues` (`UserAcceptedResolutionID`);

CREATE TABLE `tblSystem_IssueTypes`
 (
	`IssueType`			varchar NOT NULL, 
	`IssueTypeDescription`			varchar, 
	`SortCode`			INTEGER
	, PRIMARY KEY (`IssueType`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblSystem_IssueTypes_SortCode_idx` ON `tblSystem_IssueTypes` (`SortCode`);

CREATE TABLE `tblSystem_Parameters`
 (
	`AppAbbrev`			varchar, 
	`AppName`			varchar, 
	`AppDesc`			TEXT, 
	`AppCredits`			TEXT, 
	`DatabaseTypeID`			INTEGER, 
	`ForceExit`			INTEGER NOT NULL, 
	`ForceExit_Message`			TEXT, 
	`ForceExit_WaitTime`			INTEGER, 
	`MinimumRequired_FrontEnd_Version`			varchar, 
	`Default_Report_Folder`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblSystem_Parameters_DatabaseTypeID_idx` ON `tblSystem_Parameters` (`DatabaseTypeID`);

CREATE TABLE `tblSystem_ReleaseNotes_DataDatabase`
 (
	`Version`			varchar NOT NULL, 
	`StartDevDate`			DateTime, 
	`ReleaseDate`			DateTime, 
	`ReleaseNotes`			TEXT
	, PRIMARY KEY (`Version`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Annual_Inflation_Rates`
 (
	`Annual_Year`			INTEGER NOT NULL, 
	`AverageInflationRate`			REAL
	, PRIMARY KEY (`Annual_Year`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_AptitudeLevels`
 (
	`APTLevel`			INTEGER NOT NULL, 
	`APTDescription`			varchar, 
	`APTPercentiles`			varchar
	, PRIMARY KEY (`APTLevel`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_AverageWorkerProfile`
 (
	`Average_Worker_Profile_ID`			INTEGER, 
	`ClientID`			INTEGER, 
	`Reasoning`			REAL, 
	`Math`			REAL, 
	`Language`			REAL, 
	`Spatial`			REAL, 
	`Form`			REAL, 
	`Clerical`			REAL, 
	`Motor`			REAL, 
	`Finger`			REAL, 
	`Manual`			REAL, 
	`Eye-Hand-Foot`			REAL, 
	`Color`			REAL, 
	`Strength`			REAL, 
	`Climb_Balance`			REAL, 
	`Stoop_Kneel`			REAL, 
	`Reach_Handle`			REAL, 
	`Talk_Hear`			REAL, 
	`See`			REAL, 
	`Out_In_Both`			REAL, 
	`Cold`			REAL, 
	`Heat`			REAL, 
	`Wet`			REAL, 
	`Vibrations`			REAL, 
	`Hazards`			REAL, 
	`Dust_Fumes`			REAL, 
	`Achievement`			REAL, 
	`WorkingConditions`			REAL, 
	`Recognition`			REAL, 
	`Relationships`			REAL, 
	`Support`			REAL, 
	`Independence`			REAL, 
	`Vagen01m`			INTEGER, 
	`Vagen02m`			INTEGER, 
	`Vagen03m`			INTEGER, 
	`Vagen04m`			INTEGER, 
	`Vagen05m`			INTEGER, 
	`Vagen06m`			INTEGER, 
	`V01en00m`			INTEGER, 
	`V02en00m`			INTEGER, 
	`V03en00m`			INTEGER, 
	`V04en00m`			INTEGER, 
	`V05en00m`			INTEGER, 
	`V06en00m`			INTEGER, 
	`V07en00m`			INTEGER, 
	`V08en00m`			INTEGER, 
	`V09en00m`			INTEGER, 
	`V10en00m`			INTEGER, 
	`V11en00m`			INTEGER, 
	`V12en00m`			INTEGER, 
	`V13en00m`			INTEGER, 
	`V14en00m`			INTEGER, 
	`V15en00m`			INTEGER, 
	`V16en00m`			INTEGER, 
	`V17en00m`			INTEGER, 
	`V18en00m`			INTEGER, 
	`V19en00m`			INTEGER, 
	`V20en00m`			INTEGER, 
	`V21en00m`			INTEGER, 
	`ProfileTitle`			varchar
	, PRIMARY KEY (`Average_Worker_Profile_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_AverageWorkerProfile_Average_Worker_Profile_ID_idx` ON `tblXLU_AverageWorkerProfile` (`Average_Worker_Profile_ID`);
CREATE INDEX `tblXLU_AverageWorkerProfile_ClientID_idx` ON `tblXLU_AverageWorkerProfile` (`ClientID`);

CREATE TABLE `tblXLU_Counties`
 (
	`Country`			varchar, 
	`STATE`			varchar, 
	`COUNTYID`			REAL, 
	`STATEID`			REAL, 
	`COUNTRYID`			REAL, 
	`STATENUMBER`			REAL, 
	`COUNTYNUMBER`			REAL, 
	`COUNTYNAME`			varchar, 
	`FIPS02`			varchar, 
	`FIPS03`			varchar, 
	`FIPS05`			varchar, 
	`ECLR91`			REAL, 
	`ECLR92`			REAL, 
	`ECLR93`			REAL, 
	`ECLR94`			REAL, 
	`ECLR95`			REAL, 
	`ECLR96`			REAL, 
	`ECLR97`			REAL, 
	`ECLR98`			REAL, 
	`ECLR99`			REAL, 
	`ECLR00`			REAL, 
	`ECLR01`			REAL, 
	`ECLR02`			REAL, 
	`ECLR03`			REAL, 
	`ECLR04`			REAL, 
	`ECLR05`			REAL, 
	`ECLR06`			REAL, 
	`ECLR07`			REAL, 
	`ECLR08`			REAL, 
	`ECLR09`			REAL, 
	`ECLR10`			REAL, 
	`ECLR11`			REAL, 
	`ECLR12`			REAL, 
	`ECLR13`			REAL, 
	`ECLR14`			REAL, 
	`ECLR15`			REAL, 
	`ECLR16`			REAL, 
	`ECLR17`			REAL, 
	`ECLR18`			REAL, 
	`ECLR19`			REAL, 
	`ECLR20`			REAL, 
	`ECLR21`			REAL, 
	`ECLR22`			REAL, 
	`ECLR23`			REAL, 
	`ECLR24`			REAL, 
	`ECLR25`			REAL, 
	`ECLR26`			REAL, 
	`ECLR27`			REAL, 
	`ECLR28`			REAL, 
	`ECLR29`			REAL, 
	`ECLR30`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Counties_Country_idx` ON `tblXLU_Counties` (`Country`);
CREATE INDEX `tblXLU_Counties_COUNTRYID_idx` ON `tblXLU_Counties` (`COUNTRYID`);
CREATE INDEX `tblXLU_Counties_COUNTYID_idx` ON `tblXLU_Counties` (`COUNTYID`);
CREATE INDEX `tblXLU_Counties_COUNTYNAME_idx` ON `tblXLU_Counties` (`COUNTYNAME`);
CREATE INDEX `tblXLU_Counties_STATE_idx` ON `tblXLU_Counties` (`STATE`);
CREATE INDEX `tblXLU_Counties_STATEID_idx` ON `tblXLU_Counties` (`STATEID`);

CREATE TABLE `tblXLU_DatabaseUsers`
 (
	`DatabaseUserID`			INTEGER, 
	`FirstName`			varchar, 
	`MiddleInitial`			varchar, 
	`LastName`			varchar NOT NULL, 
	`Initials`			varchar, 
	`LANLogin`			varchar, 
	`ComputerName`			varchar, 
	`WorkPhone`			varchar, 
	`Extension`			varchar, 
	`DatabaseAdmin`			INTEGER NOT NULL, 
	`DatabaseAdmin_Primary`			INTEGER, 
	`TechSupport`			INTEGER NOT NULL, 
	`TechSupport_Primary`			INTEGER, 
	`DepartmentID`			INTEGER, 
	`SecurityLevelID`			INTEGER, 
	`Active`			INTEGER NOT NULL, 
	`DatabaseUser_PC_AccessVersion`			varchar, 
	`CreatedByID`			INTEGER, 
	`CreateDate`			DateTime, 
	`Country_Default`			varchar, 
	`State_Default`			varchar, 
	`County_Default`			varchar, 
	`Company_Name`			varchar, 
	`Company_ID`			INTEGER, 
	`Screen_Resolution`			varchar, 
	`User_Notes`			TEXT
	, PRIMARY KEY (`DatabaseUserID`)
);

-- CREATE INDEXES ...
CREATE UNIQUE INDEX `tblXLU_DatabaseUsers_AZeroNo_idx` ON `tblXLU_DatabaseUsers` (`LANLogin`);
CREATE INDEX `tblXLU_DatabaseUsers_CreatedByID_idx` ON `tblXLU_DatabaseUsers` (`CreatedByID`);
CREATE INDEX `tblXLU_DatabaseUsers_DatabaseAdmin_Primary_idx` ON `tblXLU_DatabaseUsers` (`DatabaseAdmin_Primary`);
CREATE INDEX `tblXLU_DatabaseUsers_DepartmentID_idx` ON `tblXLU_DatabaseUsers` (`DepartmentID`);
CREATE UNIQUE INDEX `tblXLU_DatabaseUsers_LANLogin_idx` ON `tblXLU_DatabaseUsers` (`Screen_Resolution`);
CREATE INDEX `tblXLU_DatabaseUsers_LastName_idx` ON `tblXLU_DatabaseUsers` (`LastName`);
CREATE INDEX `tblXLU_DatabaseUsers_SecurityLevelID_idx` ON `tblXLU_DatabaseUsers` (`SecurityLevelID`);
CREATE INDEX `tblXLU_DatabaseUsers_TechSupport_Primary_idx` ON `tblXLU_DatabaseUsers` (`TechSupport_Primary`);

CREATE TABLE `tblXLU_Departments`
 (
	`DepartmentID`			INTEGER, 
	`DepartmentName`			varchar, 
	`SortOrder`			INTEGER
	, PRIMARY KEY (`DepartmentID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Departments_DepartmentID_idx` ON `tblXLU_Departments` (`DepartmentID`);
CREATE INDEX `tblXLU_Departments_SortOrder_idx` ON `tblXLU_Departments` (`SortOrder`);

CREATE TABLE `tblXLU_DOT`
 (
	`DOT_ID`			INTEGER, 
	`TitleRecordNumber`			INTEGER, 
	`DOC_NO`			INTEGER, 
	`DOTCODE09`			varchar, 
	`DOTTITLE`			varchar, 
	`CASPARADC`			varchar, 
	`CASPARTTL`			varchar, 
	`CADCCIP90`			varchar, 
	`CADCCIPTTL`			varchar, 
	`CIP90`			varchar, 
	`CIP90TTL`			varchar
	, PRIMARY KEY (`DOT_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_DOT_DOC_NO_idx` ON `tblXLU_DOT` (`DOC_NO`);
CREATE INDEX `tblXLU_DOT_DOT_ID_idx` ON `tblXLU_DOT` (`DOT_ID`);
CREATE INDEX `tblXLU_DOT_DOTCODE09_idx` ON `tblXLU_DOT` (`DOTCODE09`);
CREATE INDEX `tblXLU_DOT_DOTTITLE_idx` ON `tblXLU_DOT` (`DOTTITLE`);
CREATE INDEX `tblXLU_DOT_TitleRecordNumber_idx` ON `tblXLU_DOT` (`TitleRecordNumber`);

CREATE TABLE `tblXLU_ECLR_Constants`
 (
	`ECLRMean1`			REAL, 
	`ECLRMean2`			REAL, 
	`ECLR10Var1`			REAL, 
	`ECLR10Var2`			REAL, 
	`ECLR25Var1`			REAL, 
	`ECLR25Var2`			REAL, 
	`ECLRMedian1`			REAL, 
	`ECLRMedian2`			REAL, 
	`ECLR75Var1`			REAL, 
	`ECLR75Var2`			REAL, 
	`ECLR90Var1`			REAL, 
	`ECLR90Var2`			REAL
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_ECLR_Constants_1`
 (
	`ECLRMEAN1`			REAL, 
	`ECLRMEAN2`			REAL, 
	`ECLR10VAR1`			REAL, 
	`ECLR10VAR2`			REAL, 
	`ECLR25VAR1`			REAL, 
	`ECLR25VAR2`			REAL, 
	`ECLRMEDIAN1`			REAL, 
	`ECLRMEDIAN2`			REAL, 
	`ECLR75VAR1`			REAL, 
	`ECLR75VAR2`			REAL, 
	`ECLR90VAR1`			REAL, 
	`ECLR90VAR2`			REAL
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_ECLR_Constants_2`
 (
	`ECLRMEAN1`			REAL, 
	`ECLRMEAN2`			REAL, 
	`ECLR10VAR1`			REAL, 
	`ECLR10VAR2`			REAL, 
	`ECLR25VAR1`			REAL, 
	`ECLR25VAR2`			REAL, 
	`ECLRMEDIAN1`			REAL, 
	`ECLRMEDIAN2`			REAL, 
	`ECLR75VAR1`			REAL, 
	`ECLR75VAR2`			REAL, 
	`ECLR90VAR1`			REAL, 
	`ECLR90VAR2`			REAL
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_ECLR_Constants_4`
 (
	`ECLRMEAN1`			REAL, 
	`ECLRMEAN2`			REAL, 
	`ECLR10VAR1`			REAL, 
	`ECLR10VAR2`			REAL, 
	`ECLR25VAR1`			REAL, 
	`ECLR25VAR2`			REAL, 
	`ECLRMEDIAN1`			REAL, 
	`ECLRMEDIAN2`			REAL, 
	`ECLR75VAR1`			REAL, 
	`ECLR75VAR2`			REAL, 
	`ECLR90VAR1`			REAL, 
	`ECLR90VAR2`			REAL
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_ElementLevels`
 (
	`ElementLevel`			INTEGER NOT NULL, 
	`ElementDescription`			varchar
	, PRIMARY KEY (`ElementLevel`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_ElementLevels_ElementCode_idx` ON `tblXLU_ElementLevels` (`ElementLevel`);

CREATE TABLE `tblXLU_GEDLevels`
 (
	`GEDLevel`			INTEGER NOT NULL, 
	`GEDDescription`			varchar, 
	`GEDPercentile`			varchar
	, PRIMARY KEY (`GEDLevel`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Help`
 (
	`HelpCode`			INTEGER, 
	`HelpText`			TEXT, 
	`HelpIndex`			varchar, 
	`HelpForm`			varchar
	, PRIMARY KEY (`HelpCode`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Help_HelpCode_idx` ON `tblXLU_Help` (`HelpCode`);
CREATE UNIQUE INDEX `tblXLU_Help_HelpIndex_idx` ON `tblXLU_Help` (`HelpIndex`);

CREATE TABLE `tblXLU_Job_Categories`
 (
	`JobCategoryID`			INTEGER, 
	`JOBCAT`			varchar, 
	`CATEGORY`			varchar, 
	`Count`			INTEGER, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`JobCategoryID`)
);

-- CREATE INDEXES ...
CREATE UNIQUE INDEX `tblXLU_Job_Categories_JOBCAT_idx` ON `tblXLU_Job_Categories` (`JOBCAT`);
CREATE INDEX `tblXLU_Job_Categories_JobCategoryID_idx` ON `tblXLU_Job_Categories` (`JobCategoryID`);
CREATE INDEX `tblXLU_Job_Categories_Sort_Order_idx` ON `tblXLU_Job_Categories` (`Sort_Order`);

CREATE TABLE `tblXLU_Job_Search_Websites`
 (
	`WebSiteID`			INTEGER, 
	`Job_Search_Category`			varchar, 
	`Job_Search_Company`			varchar, 
	`Website`			TEXT, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`WebSiteID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Job_Search_Websites_RatingDescriptionID_idx` ON `tblXLU_Job_Search_Websites` (`WebSiteID`);
CREATE INDEX `tblXLU_Job_Search_Websites_Sequence_idx` ON `tblXLU_Job_Search_Websites` (`Sort_Order`);

CREATE TABLE `tblXLU_McPlotRating_Examples`
 (
	`McPlot_Rating_Example_ID`			INTEGER, 
	`Trait_Category_Code`			varchar, 
	`VariableNumber`			varchar, 
	`VariableName`			varchar, 
	`Level`			INTEGER, 
	`Example_No`			varchar, 
	`Example_Description`			TEXT, 
	`Sort_Order`			INTEGER, 
	`Active`			INTEGER NOT NULL
	, PRIMARY KEY (`McPlot_Rating_Example_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_McPlotRating_Examples_McPlot_Rating_Example_ID_idx` ON `tblXLU_McPlotRating_Examples` (`McPlot_Rating_Example_ID`);
CREATE INDEX `tblXLU_McPlotRating_Examples_Sort_Order_idx` ON `tblXLU_McPlotRating_Examples` (`Sort_Order`);
CREATE INDEX `tblXLU_McPlotRating_Examples_Trait_Category_Code_idx` ON `tblXLU_McPlotRating_Examples` (`Trait_Category_Code`);

CREATE TABLE `tblXLU_McPlotRatingScales`
 (
	`RatingID`			INTEGER, 
	`Trait_Category_Code`			varchar, 
	`RatingCriteriaID`			INTEGER, 
	`VariableNumber`			varchar, 
	`VariableName`			varchar, 
	`Sequence`			REAL, 
	`Level`			INTEGER, 
	`Level_Initials`			varchar, 
	`Level_Descriptions`			varchar, 
	`Examples`			varchar, 
	`Percentile_Ranges`			varchar, 
	`Skill_Levels`			varchar, 
	`Rating_Variable_Notes`			TEXT, 
	`Sort_Order`			INTEGER, 
	`Active`			INTEGER NOT NULL
	, PRIMARY KEY (`RatingID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_McPlotRatingScales_RatingCriteriaID_idx` ON `tblXLU_McPlotRatingScales` (`RatingCriteriaID`);
CREATE INDEX `tblXLU_McPlotRatingScales_RatingID_idx` ON `tblXLU_McPlotRatingScales` (`RatingID`);
CREATE INDEX `tblXLU_McPlotRatingScales_Sort_Order_idx` ON `tblXLU_McPlotRatingScales` (`Sort_Order`);
CREATE INDEX `tblXLU_McPlotRatingScales_Trait_Category_Code_idx` ON `tblXLU_McPlotRatingScales` (`Trait_Category_Code`);

CREATE TABLE `tblXLU_Occupations`
 (
	`OccupationID`			INTEGER, 
	`Dot_Code`			varchar, 
	`Title`			varchar, 
	`Doc_No`			varchar, 
	`JOBCAT`			varchar, 
	`Ind1`			varchar, 
	`Ind2`			varchar, 
	`Ind3`			varchar, 
	`Ind4`			varchar, 
	`GOE`			varchar, 
	`SIC`			varchar, 
	`SOC`			varchar, 
	`CEN`			varchar, 
	`Cen1`			varchar, 
	`CENTITLE`			varchar, 
	`CENOCC2000`			varchar, 
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
	`Pop_Work_Job_Count`			REAL, 
	`ONETCAT`			varchar, 
	`ONETCODE`			varchar, 
	`ONETTITLE`			varchar, 
	`ONETDESC`			varchar, 
	`EQ`			REAL
	, PRIMARY KEY (`OccupationID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Occupations_DocNo_idx` ON `tblXLU_Occupations` (`Doc_No`);
CREATE INDEX `tblXLU_Occupations_DOT_idx` ON `tblXLU_Occupations` (`Dot_Code`);
CREATE INDEX `tblXLU_Occupations_ONETCODE_idx` ON `tblXLU_Occupations` (`ONETCODE`);

CREATE TABLE `tblXLU_Occupations_12775PRE`
 (
	`ID`			INTEGER, 
	`TitleRecordNumber`			REAL, 
	`Record`			REAL, 
	`Doc No`			varchar, 
	`STEMREC`			varchar, 
	`DOTCODE09`			varchar, 
	`DOTTITLE2`			varchar, 
	`DOTCODE11`			varchar, 
	`DOTTITLE`			varchar, 
	`JOBCAT`			varchar, 
	`CATEGORY`			varchar, 
	`VQ1`			REAL, 
	`SVP1`			REAL, 
	`SVPLENTH`			varchar, 
	`ZONE1`			REAL, 
	`OESCODE`			varchar, 
	`OESTITLE`			varchar, 
	`OESVQ1X`			REAL, 
	`ONETCAT`			varchar, 
	`ONETCODE`			varchar, 
	`ONETTITLE`			varchar, 
	`ONETDESC`			varchar, 
	`GOEIA`			varchar, 
	`GOEIATITLE`			varchar, 
	`GOEWG`			varchar, 
	`GOEWGTITLE`			varchar, 
	`GOE06`			varchar, 
	`GOE06TITLE`			varchar, 
	`HOLLANDIA`			REAL, 
	`HOLLATITLE`			varchar, 
	`HOLLAND1IA`			REAL, 
	`HOLLAND1TI`			varchar, 
	`HOLLAND2IA`			REAL, 
	`HOLLAND2TI`			varchar, 
	`HOLLAND3IA`			REAL, 
	`HOLLAND3TI`			varchar, 
	`VIPRORD`			varchar, 
	`VIPRTYPE`			varchar, 
	`OAP`			varchar, 
	`OAPTITLE`			varchar, 
	`SIC`			varchar, 
	`SICTITLE`			varchar, 
	`NAICS`			varchar, 
	`NAICSTEXT`			varchar, 
	`SOC`			varchar, 
	`SOCTITLE`			varchar, 
	`SOCCODEMAJ`			varchar, 
	`SOCMAJTITLE`			varchar, 
	`SOCCODE`			varchar, 
	`SOCTITLE_1`			varchar, 
	`SOCCODE_11`			varchar, 
	`SOCTITLE_11`			varchar, 
	`SOCCODEa`			varchar, 
	`SOCTITLE_1a`			varchar, 
	`SOCCODEVQ1`			REAL, 
	`ONETSOC`			varchar, 
	`ONETSOCTIT`			varchar, 
	`ONETSOCDES`			varchar, 
	`CEN`			varchar, 
	`Cen1`			varchar, 
	`CENTITLE`			varchar, 
	`CENOCC2000`			varchar, 
	`MPS`			varchar, 
	`MPSTITLE`			varchar, 
	`MPS2`			varchar, 
	`MPS2TITLE`			varchar, 
	`MPS3`			varchar, 
	`MPS3TITLE`			varchar, 
	`UPDATE`			varchar, 
	`WF1`			varchar, 
	`WF1TITLE`			varchar, 
	`WF2`			varchar, 
	`WF2TITLE`			varchar, 
	`WF3`			varchar, 
	`WF3TITLE`			varchar, 
	`IND`			varchar, 
	`IND1`			varchar, 
	`NOC`			varchar, 
	`NOCTITLE`			varchar, 
	`NOCSOCDES`			varchar, 
	`DATA`			REAL, 
	`DFUNCTION`			varchar, 
	`PEOPLE`			REAL, 
	`PFUNCTION`			varchar, 
	`THINGS`			REAL, 
	`TFUNCTION`			varchar, 
	`VAGEN01M`			REAL, 
	`VAGEN02M`			REAL, 
	`VAGEN03M`			REAL, 
	`VAGEN04M`			REAL, 
	`VAGEN05M`			REAL, 
	`VAGEN06M`			REAL, 
	`V01EN00M`			REAL, 
	`V02EN00M`			REAL, 
	`V03EN00M`			REAL, 
	`V04EN00M`			REAL, 
	`V05EN00M`			REAL, 
	`V06EN00M`			REAL, 
	`V07EN00M`			REAL, 
	`V08EN00M`			REAL, 
	`V09EN00M`			REAL, 
	`V10EN00M`			REAL, 
	`V11EN00M`			REAL, 
	`V12EN00M`			REAL, 
	`V13EN00M`			REAL, 
	`V14EN00M`			REAL, 
	`V15EN00M`			REAL, 
	`V16EN00M`			REAL, 
	`V17EN00M`			REAL, 
	`V18EN00M`			REAL, 
	`V19EN00M`			REAL, 
	`V20EN00M`			REAL, 
	`V21EN00M`			REAL
	, PRIMARY KEY (`ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Occupations_12775PRE_OESCODE_idx` ON `tblXLU_Occupations_12775PRE` (`OESCODE`);
CREATE INDEX `tblXLU_Occupations_12775PRE_ONETOUCODE_idx` ON `tblXLU_Occupations_12775PRE` (`ONETCODE`);
CREATE INDEX `tblXLU_Occupations_12775PRE_SOCCODE_idx` ON `tblXLU_Occupations_12775PRE` (`SOCCODE`);

CREATE TABLE `tblXLU_Occupations_Alternate_Titles`
 (
	`TitleRecordNumber`			INTEGER, 
	`Doc_No`			varchar, 
	`Alternate_Title`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Occupations_Alternate_Titles_TitleRecord_idx` ON `tblXLU_Occupations_Alternate_Titles` (`TitleRecordNumber`);

CREATE TABLE `tblXLU_Occupations_CASPAR`
 (
	`TitleRecordNumber`			INTEGER, 
	`DOC_NO`			INTEGER, 
	`DOTCODE09`			varchar, 
	`DOTTITLE`			varchar, 
	`CASPARADC`			varchar, 
	`CASPARTTL`			varchar, 
	`CADCCIP90`			varchar, 
	`CADCCIPTTL`			varchar, 
	`CIP90`			varchar, 
	`CIP90TTL`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Occupations_CASPAR_TitleRecordNumber_idx` ON `tblXLU_Occupations_CASPAR` (`TitleRecordNumber`);

CREATE TABLE `tblXLU_Occupations_TEM_JOLT`
 (
	`TitleRecordNumber`			REAL, 
	`Record`			REAL, 
	`Doc No`			REAL, 
	`StemRec`			REAL, 
	`DOTCode09`			varchar, 
	`DOTTitle2`			varchar, 
	`DOTCode11`			varchar, 
	`DOTTitle`			varchar, 
	`TEMDIR`			REAL, 
	`TEMREP`			REAL, 
	`TEMINF`			REAL, 
	`TEMVAR`			REAL, 
	`TEMEXP`			REAL, 
	`TEMALO`			REAL, 
	`TEMSTR`			REAL, 
	`TEMTOL`			REAL, 
	`TEMUND`			REAL, 
	`TEMPEO`			REAL, 
	`TEMJUD`			REAL, 
	`JS99YrlyOpen`			REAL, 
	`JOLT99YrlyOpen`			REAL, 
	`SOC99CurEmp`			REAL, 
	`JS05YrlyOpen`			REAL, 
	`JOLT05YrlyOpen`			REAL, 
	`SOC05CurEmp`			REAL
);

-- CREATE INDEXES ...
CREATE UNIQUE INDEX `tblXLU_Occupations_TEM_JOLT_TitleRecordNumber_idx` ON `tblXLU_Occupations_TEM_JOLT` (`TitleRecordNumber`);

CREATE TABLE `tblXLU_Occupations_Transferrable_Skills`
 (
	`DOTCODE09`			varchar, 
	`VQ1`			REAL, 
	`SVP1`			INTEGER, 
	`ONETOUCODE`			varchar, 
	`TS`			INTEGER, 
	`DESCRIPT`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Occupations_Transferrable_Skills_ONETOUCODE_idx` ON `tblXLU_Occupations_Transferrable_Skills` (`ONETOUCODE`);

CREATE TABLE `tblXLU_ONET_Codes`
 (
	`ONETCODE`			varchar, 
	`ONETTITLE`			varchar, 
	`ONETCAT`			varchar, 
	`Count`			INTEGER
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Person_Job_Traits`
 (
	`Trait_Category_Code`			varchar NOT NULL, 
	`Trait_Category`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Trait_Category_Code`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Person_Job_Traits_Sort_Order_idx` ON `tblXLU_Person_Job_Traits` (`Sort_Order`);
CREATE INDEX `tblXLU_Person_Job_Traits_TestCategoryID_idx` ON `tblXLU_Person_Job_Traits` (`Trait_Category_Code`);

CREATE TABLE `tblXLU_Personality_Type_Indicators`
 (
	`Personality_Type_Indicator_ID`			INTEGER, 
	`Personality_Type_Indicator`			varchar, 
	`Personality_Type_Indicator_Description`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Personality_Type_Indicator_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Personality_Type_Indicators_Sort_Order_idx` ON `tblXLU_Personality_Type_Indicators` (`Sort_Order`);
CREATE INDEX `tblXLU_Personality_Type_Indicators_Test_Paid_Category_ID_idx` ON `tblXLU_Personality_Type_Indicators` (`Personality_Type_Indicator_ID`);
CREATE UNIQUE INDEX `tblXLU_Personality_Type_Indicators_Test_Pair_Indicator_idx` ON `tblXLU_Personality_Type_Indicators` (`Personality_Type_Indicator`);

CREATE TABLE `tblXLU_Personality_Types`
 (
	`Personality_Type`			varchar NOT NULL, 
	`Personality_Name`			varchar, 
	`Personality_Type_Description`			TEXT, 
	`JobDescripts`			TEXT, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`Personality_Type`)
);

-- CREATE INDEXES ...
CREATE UNIQUE INDEX `tblXLU_Personality_Types_ORD_idx` ON `tblXLU_Personality_Types` (`Sort_Order`);

CREATE TABLE `tblXLU_PhoneDescriptions`
 (
	`PhoneDescriptionID`			INTEGER, 
	`PhoneDescription`			varchar, 
	`SortOrder`			INTEGER
	, PRIMARY KEY (`PhoneDescriptionID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_PhoneDescriptions_DomainID_idx` ON `tblXLU_PhoneDescriptions` (`PhoneDescriptionID`);

CREATE TABLE `tblXLU_PhysicalEnvironmentalLevels`
 (
	`PhysicalLevel`			INTEGER NOT NULL, 
	`PhysicalDescription`			varchar, 
	`PhysicalPercentile`			varchar
	, PRIMARY KEY (`PhysicalLevel`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Ratings`
 (
	`RatingID`			INTEGER, 
	`RatingName`			varchar, 
	`VariableNumber`			varchar, 
	`Guidelines`			varchar, 
	`Default_Ratings`			INTEGER NOT NULL, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`RatingID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Ratings_RatingDescriptionID_idx` ON `tblXLU_Ratings` (`RatingID`);
CREATE INDEX `tblXLU_Ratings_Sequence_idx` ON `tblXLU_Ratings` (`Sort_Order`);

CREATE TABLE `tblXLU_SCALES`
 (
	`Standard`			REAL NOT NULL, 
	`Percentile`			REAL, 
	`GEDEffect`			REAL, 
	`APTEffect`			REAL
	, PRIMARY KEY (`Standard`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_SCORES`
 (
	`Percentile`			REAL NOT NULL, 
	`Standard`			REAL
	, PRIMARY KEY (`Percentile`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_SecurityLevels`
 (
	`SecurityLevelID`			INTEGER, 
	`SecurityLevelShortDescription`			varchar, 
	`SecurityLevelDescription`			varchar, 
	`SortOrder`			INTEGER, 
	`Active`			INTEGER NOT NULL
	, PRIMARY KEY (`SecurityLevelID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_SecurityLevels_SecurityLevelCode_idx` ON `tblXLU_SecurityLevels` (`SecurityLevelShortDescription`);
CREATE INDEX `tblXLU_SecurityLevels_SecurityLevelID_idx` ON `tblXLU_SecurityLevels` (`SecurityLevelID`);

CREATE TABLE `tblXLU_States_Provinces`
 (
	`StateID`			INTEGER, 
	`CountryID`			INTEGER, 
	`StateNumber`			INTEGER, 
	`StateAbbrev`			varchar, 
	`State_Province`			varchar, 
	`Country`			varchar, 
	`MDBName`			varchar, 
	`Installed`			INTEGER NOT NULL, 
	`Sort_Order`			INTEGER
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_States_Provinces_CountryID_idx` ON `tblXLU_States_Provinces` (`CountryID`);
CREATE INDEX `tblXLU_States_Provinces_CountyID_idx` ON `tblXLU_States_Provinces` (`StateID`);

CREATE TABLE `tblXLU_StrengthLevels`
 (
	`StrengthLevel`			INTEGER NOT NULL, 
	`StrengthDescription`			varchar, 
	`StrengthPercentile`			varchar
	, PRIMARY KEY (`StrengthLevel`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_SVPLevels`
 (
	`SVPLevel`			INTEGER NOT NULL, 
	`SVPDescription`			varchar, 
	`SVPSkill`			varchar
	, PRIMARY KEY (`SVPLevel`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_SVPLevels_ElementCode_idx` ON `tblXLU_SVPLevels` (`SVPLevel`);

CREATE TABLE `tblXLU_Test_Defaults`
 (
	`TestID`			INTEGER, 
	`TestCategoryID`			INTEGER, 
	`Default_Test_ID`			INTEGER, 
	`Default_User_ID`			INTEGER, 
	`Default_Category`			varchar, 
	`Default_Tests`			INTEGER NOT NULL, 
	`Sort_Order`			INTEGER, 
	`Select_Test`			INTEGER NOT NULL, 
	`foo`			varchar
	, PRIMARY KEY (`Default_Test_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Test_Defaults_Default_Test_ID_idx` ON `tblXLU_Test_Defaults` (`Default_Test_ID`);
CREATE INDEX `tblXLU_Test_Defaults_Default_User_ID_idx` ON `tblXLU_Test_Defaults` (`Default_User_ID`);
CREATE INDEX `tblXLU_Test_Defaults_TestCategoryID_idx` ON `tblXLU_Test_Defaults` (`TestCategoryID`);
CREATE INDEX `tblXLU_Test_Defaults_TestID_idx` ON `tblXLU_Test_Defaults` (`TestID`);
CREATE UNIQUE INDEX `tblXLU_Test_Defaults_Unique_Default_Test_idx` ON `tblXLU_Test_Defaults` (`TestID`, `Default_User_ID`, `Default_Category`);

CREATE TABLE `tblXLU_TestCategories`
 (
	`TestCategoryID`			INTEGER, 
	`TestCategory`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`TestCategoryID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_TestCategories_TestCategoryID_idx` ON `tblXLU_TestCategories` (`TestCategoryID`);

CREATE TABLE `tblXLU_Tests`
 (
	`TestCategoryID`			INTEGER, 
	`TestID`			INTEGER, 
	`SUBTEST`			varchar, 
	`GED`			varchar, 
	`APTITUDES`			varchar, 
	`GEDR1`			INTEGER NOT NULL, 
	`GEDM1`			INTEGER NOT NULL, 
	`GEDL1`			INTEGER NOT NULL, 
	`APTG1`			INTEGER NOT NULL, 
	`APTV1`			INTEGER NOT NULL, 
	`APTN1`			INTEGER NOT NULL, 
	`APTS1`			INTEGER NOT NULL, 
	`APTP1`			INTEGER NOT NULL, 
	`APTQ1`			INTEGER NOT NULL, 
	`APTK1`			INTEGER NOT NULL, 
	`APTF1`			INTEGER NOT NULL, 
	`APTM1`			INTEGER NOT NULL, 
	`APTE1`			INTEGER NOT NULL, 
	`APTC1`			INTEGER NOT NULL, 
	`SelectThisTest`			INTEGER NOT NULL, 
	`GEDR1Score`			REAL, 
	`GEDM1Score`			REAL, 
	`GEDL1Score`			REAL, 
	`APTG1Score`			REAL, 
	`APTV1Score`			REAL, 
	`APTN1Score`			REAL, 
	`APTS1Score`			REAL, 
	`APTP1Score`			REAL, 
	`APTQ1Score`			REAL, 
	`APTK1Score`			REAL, 
	`APTF1Score`			REAL, 
	`APTM1Score`			REAL, 
	`APTE1Score`			REAL, 
	`APTC1Score`			REAL, 
	`Standard`			REAL, 
	`Percentile`			REAL, 
	`GEDEffect`			REAL, 
	`APTEffect`			REAL, 
	`Default_User_ID`			INTEGER, 
	`Default_Category`			varchar, 
	`Default_Tests`			INTEGER NOT NULL, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`TestID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Tests_BatteryID_idx` ON `tblXLU_Tests` (`TestID`);
CREATE INDEX `tblXLU_Tests_Default_User_ID_idx` ON `tblXLU_Tests` (`Default_User_ID`);
CREATE UNIQUE INDEX `tblXLU_Tests_Std_idx` ON `tblXLU_Tests` (`Standard`);
CREATE INDEX `tblXLU_Tests_TestCategoryID_idx` ON `tblXLU_Tests` (`TestCategoryID`);

CREATE TABLE `tblXLU_TSPReportLevels`
 (
	`TSPNumber`			INTEGER NOT NULL, 
	`TSPLevel`			varchar, 
	`JobMatches`			INTEGER, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`TSPNumber`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_USBLS_OES_State_Data`
 (
	`area`			varchar, 
	`area_title`			varchar, 
	`area_type`			varchar, 
	`naics`			varchar, 
	`naics_title`			varchar, 
	`i_group`			varchar, 
	`own_code`			varchar, 
	`occ_code`			varchar, 
	`occ_title`			varchar, 
	`o_group`			varchar, 
	`tot_emp`			INTEGER, 
	`emp_prse`			varchar, 
	`jobs_1000`			varchar, 
	`loc_quotient`			varchar, 
	`pct_total`			varchar, 
	`h_mean`			REAL, 
	`a_mean`			REAL, 
	`mean_prse`			varchar, 
	`h_pct10`			varchar, 
	`h_pct25`			varchar, 
	`h_median`			varchar, 
	`h_pct75`			varchar, 
	`h_pct90`			varchar, 
	`a_pct10`			varchar, 
	`a_pct25`			varchar, 
	`a_median`			varchar, 
	`a_pct75`			varchar, 
	`a_pct90`			varchar, 
	`annual`			varchar, 
	`hourly`			varchar, 
	`ONETCODE`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_USBLS_OES_State_Data_occ_code_idx` ON `tblXLU_USBLS_OES_State_Data` (`occ_code`);
CREATE INDEX `tblXLU_USBLS_OES_State_Data_ONETCODE_idx` ON `tblXLU_USBLS_OES_State_Data` (`ONETCODE`);
CREATE INDEX `tblXLU_USBLS_OES_State_Data_own_code_idx` ON `tblXLU_USBLS_OES_State_Data` (`own_code`);

CREATE TABLE `tblXLU_Value_Answers`
 (
	`VALUE`			INTEGER NOT NULL, 
	`LABEL`			varchar, 
	`Count`			INTEGER
	, PRIMARY KEY (`VALUE`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Value_Categories`
 (
	`ValueCategoryID`			INTEGER, 
	`ValueCategory`			varchar, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`ValueCategoryID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Value_Categories_TestCategoryID_idx` ON `tblXLU_Value_Categories` (`ValueCategoryID`);

CREATE TABLE `tblXLU_Value_Options`
 (
	`OCValueID`			INTEGER, 
	`OCVALUES`			varchar, 
	`SHORTLABEL`			varchar, 
	`DESCRIPT`			TEXT, 
	`VALUE`			REAL, 
	`LABEL`			varchar, 
	`DESIRE`			varchar
	, PRIMARY KEY (`OCValueID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Value_Options_OCValueID_idx` ON `tblXLU_Value_Options` (`OCValueID`);

CREATE TABLE `tblXLU_Values`
 (
	`ValueCategoryID`			INTEGER, 
	`ValueID`			INTEGER, 
	`OCVALUES`			varchar, 
	`SHORTLABEL`			varchar, 
	`DESCRIPT`			TEXT, 
	`DESIRE`			varchar, 
	`Count`			INTEGER, 
	`Default_Value`			INTEGER NOT NULL, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`ValueID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Values_ValueCategoryID_idx` ON `tblXLU_Values` (`ValueCategoryID`);
CREATE INDEX `tblXLU_Values_valueID_idx` ON `tblXLU_Values` (`ValueID`);

CREATE TABLE `tblXLU_VIPR_Test_Pairs`
 (
	`TestNumber`			INTEGER, 
	`VIPR_Test_Pair_ID`			INTEGER, 
	`DOTCODE1`			varchar, 
	`Title1`			varchar, 
	`DOTCODE2`			varchar, 
	`Title2`			varchar, 
	`Selection`			INTEGER, 
	`Indicator1`			varchar, 
	`Indicator2`			varchar, 
	`EScore`			varchar, 
	`IScore`			varchar, 
	`Sscore`			varchar, 
	`NScore`			varchar, 
	`Tscore`			varchar, 
	`FScore`			varchar, 
	`JScore`			varchar, 
	`PScore`			varchar, 
	`Default_Pair`			INTEGER NOT NULL, 
	`Sort_Order`			INTEGER
	, PRIMARY KEY (`VIPR_Test_Pair_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_VIPR_Test_Pairs_VIPR_Test_Pair_ID_idx` ON `tblXLU_VIPR_Test_Pairs` (`VIPR_Test_Pair_ID`);

CREATE TABLE `tblXLU_WeatherLevels`
 (
	`WeatherLevel`			INTEGER NOT NULL, 
	`WeatherDescription`			varchar, 
	`WeatherPercentile`			varchar
	, PRIMARY KEY (`WeatherLevel`)
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Work_History_Value_Defaults`
 (
	`V01en00m`			INTEGER, 
	`V02en00m`			INTEGER, 
	`V03en00m`			INTEGER, 
	`V04en00m`			INTEGER, 
	`V05en00m`			INTEGER, 
	`V06en00m`			INTEGER, 
	`V07en00m`			INTEGER, 
	`V08en00m`			INTEGER, 
	`V09en00m`			INTEGER, 
	`V10en00m`			INTEGER, 
	`V11en00m`			INTEGER, 
	`V12en00m`			INTEGER, 
	`V13en00m`			INTEGER, 
	`V14en00m`			INTEGER, 
	`V15en00m`			INTEGER, 
	`V16en00m`			INTEGER, 
	`V17en00m`			INTEGER, 
	`V18en00m`			INTEGER, 
	`V19en00m`			INTEGER, 
	`V20en00m`			INTEGER, 
	`V21en00m`			INTEGER
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_ZoneLevels`
 (
	`ZoneLevel`			INTEGER NOT NULL, 
	`ZoneDescription`			varchar
	, PRIMARY KEY (`ZoneLevel`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_ZoneLevels_ElementCode_idx` ON `tblXLU_ZoneLevels` (`ZoneLevel`);

CREATE TABLE `tblEvaluee_Post_ECLR`
 (
	`PersonID`			INTEGER, 
	`Dot_Code`			varchar, 
	`MVQ`			REAL, 
	`AVQ`			REAL, 
	`NVQ`			REAL, 
	`PostMean`			REAL, 
	`Post10`			REAL, 
	`Post25`			REAL, 
	`PostMedian`			REAL, 
	`Post75`			REAL, 
	`Post90`			REAL
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_ECLR_Dot_Code_idx` ON `tblEvaluee_Post_ECLR` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Post_ECLR_PersonID_idx` ON `tblEvaluee_Post_ECLR` (`PersonID`);

CREATE TABLE `tblEvaluee_Post_Jobs`
 (
	`PersonID`			INTEGER, 
	`CountryID`			INTEGER, 
	`CountyNumber`			INTEGER, 
	`State`			varchar, 
	`Title`			varchar, 
	`Dot_Code`			varchar, 
	`PO00`			INTEGER, 
	`PO01`			INTEGER, 
	`PO02`			INTEGER, 
	`PO03`			INTEGER, 
	`PO04`			INTEGER, 
	`PO05`			INTEGER, 
	`PO06`			INTEGER, 
	`PO07`			INTEGER, 
	`PO08`			INTEGER, 
	`PO09`			INTEGER, 
	`VQ`			REAL, 
	`ONETCODE`			varchar, 
	`Oucode`			varchar, 
	`JOBCAT`			varchar, 
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
	`Cen`			varchar, 
	`GEDR1`			INTEGER, 
	`GEDM1`			INTEGER, 
	`GEDL1`			INTEGER, 
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
	`TSP`			INTEGER, 
	`Sort_Order`			INTEGER
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Post_Jobs_CountryID_idx` ON `tblEvaluee_Post_Jobs` (`CountryID`);
CREATE INDEX `tblEvaluee_Post_Jobs_Dot_Code_idx` ON `tblEvaluee_Post_Jobs` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Post_Jobs_ONETCODE_idx` ON `tblEvaluee_Post_Jobs` (`ONETCODE`);
CREATE INDEX `tblEvaluee_Post_Jobs_Oucode_idx` ON `tblEvaluee_Post_Jobs` (`Oucode`);
CREATE INDEX `tblEvaluee_Post_Jobs_PersonID_idx` ON `tblEvaluee_Post_Jobs` (`PersonID`);

CREATE TABLE `tblEvaluee_Pre_TCP_Levels`
 (
	`PersonID`			INTEGER, 
	`Dot_Code`			varchar, 
	`TSP80`			INTEGER, 
	`TSP60`			INTEGER, 
	`TSP40`			INTEGER, 
	`TSP20`			INTEGER, 
	`TSP0`			INTEGER
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Pre_TCP_Levels_Dot_Code_idx` ON `tblEvaluee_Pre_TCP_Levels` (`Dot_Code`);
CREATE INDEX `tblEvaluee_Pre_TCP_Levels_PersonID_idx` ON `tblEvaluee_Pre_TCP_Levels` (`PersonID`);

CREATE TABLE `tblEvaluee_Test_Scores_Summary`
 (
	`PersonID`			INTEGER, 
	`GEDR1`			INTEGER, 
	`GEDM1`			INTEGER, 
	`GEDL1`			INTEGER, 
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
	`APTC1`			INTEGER
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Test_Scores_Summary_PersonID_idx` ON `tblEvaluee_Test_Scores_Summary` (`PersonID`);

CREATE TABLE `tblEvaluee_Work_History_Values`
 (
	`PersonID`			INTEGER, 
	`Evaluee_WH_Values_ID`			INTEGER, 
	`V01`			REAL, 
	`V02`			REAL, 
	`V03`			REAL, 
	`V04`			REAL, 
	`V05`			REAL, 
	`V06`			REAL, 
	`V07`			REAL, 
	`V08`			REAL, 
	`V09`			REAL, 
	`V10`			REAL, 
	`V11`			REAL, 
	`V12`			REAL, 
	`V13`			REAL, 
	`V14`			REAL, 
	`V15`			REAL, 
	`V16`			REAL, 
	`V17`			REAL, 
	`V18`			REAL, 
	`V19`			REAL, 
	`V20`			REAL, 
	`V21`			REAL
	, PRIMARY KEY (`Evaluee_WH_Values_ID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblEvaluee_Work_History_Values_Evaluee_WH_Values_ID_idx` ON `tblEvaluee_Work_History_Values` (`Evaluee_WH_Values_ID`);

CREATE TABLE `tblSystem_IssuePriorities`
 (
	`PriorityCode`			varchar NOT NULL, 
	`PriorityDescription`			varchar, 
	`SortCode`			INTEGER
	, PRIMARY KEY (`PriorityCode`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblSystem_IssuePriorities_SortCode_idx` ON `tblSystem_IssuePriorities` (`SortCode`);

CREATE TABLE `tblXLU_Countries`
 (
	`CountryID`			INTEGER NOT NULL, 
	`Country`			varchar
	, PRIMARY KEY (`CountryID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Countries_Country_idx` ON `tblXLU_Countries` (`Country`);
CREATE INDEX `tblXLU_Countries_CountryID_idx` ON `tblXLU_Countries` (`CountryID`);

CREATE TABLE `tblXLU_ECLR_Constants_3`
 (
	`ECLRMEAN1`			REAL, 
	`ECLRMEAN2`			REAL, 
	`ECLR10VAR1`			REAL, 
	`ECLR10VAR2`			REAL, 
	`ECLR25VAR1`			REAL, 
	`ECLR25VAR2`			REAL, 
	`ECLRMEDIAN1`			REAL, 
	`ECLRMEDIAN2`			REAL, 
	`ECLR75VAR1`			REAL, 
	`ECLR75VAR2`			REAL, 
	`ECLR90VAR1`			REAL, 
	`ECLR90VAR2`			REAL
);

-- CREATE INDEXES ...

CREATE TABLE `tblXLU_Occupation_Details`
 (
	`TitleRecordNumber`			INTEGER, 
	`Doc no`			varchar, 
	`Dotcode`			varchar, 
	`Dotcode11`			varchar, 
	`Title`			varchar, 
	`Dottitle2`			varchar, 
	`Oescode`			varchar, 
	`Oestitle`			varchar, 
	`Oucode`			varchar, 
	`Outitle`			varchar, 
	`Cat`			varchar, 
	`Category`			varchar, 
	`Div`			varchar, 
	`Division`			varchar, 
	`Grp`			varchar, 
	`Group`			varchar, 
	`Goeia`			varchar, 
	`Goeiatitle`			varchar, 
	`Hollatitle`			varchar, 
	`Oap`			varchar, 
	`Goewg`			varchar, 
	`Oapgoewgti`			varchar, 
	`Dataoap`			varchar, 
	`Gatboap`			varchar, 
	`Oap2`			varchar, 
	`Dataoap2`			varchar, 
	`Gatboap2`			varchar, 
	`Goe06`			varchar, 
	`Sic`			varchar, 
	`Sictitle`			varchar, 
	`Soc`			varchar, 
	`Soctitle`			varchar, 
	`Cen`			varchar, 
	`Centitle`			varchar, 
	`Mps`			varchar, 
	`Mpstitle`			varchar, 
	`Mps2`			varchar, 
	`Mps2title`			varchar, 
	`Mps3`			varchar, 
	`Mps3title`			varchar, 
	`Wf1`			varchar, 
	`Wf1title`			varchar, 
	`Wf2`			varchar, 
	`Wf3`			varchar, 
	`Updategov`			varchar, 
	`Update`			varchar, 
	`Vq`			REAL, 
	`Data`			varchar, 
	`Datavi`			varchar, 
	`Dfunction`			varchar, 
	`People`			varchar, 
	`Peoplevi`			varchar, 
	`Pfunction`			varchar, 
	`Things`			varchar, 
	`Thingsvi`			varchar, 
	`Tfunction`			varchar, 
	`Svp`			varchar, 
	`Svplenth`			varchar, 
	`Ptr`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Occupation_Details_Dotcode_idx` ON `tblXLU_Occupation_Details` (`Dotcode`);
CREATE INDEX `tblXLU_Occupation_Details_Oescode_idx` ON `tblXLU_Occupation_Details` (`Oescode`);
CREATE INDEX `tblXLU_Occupation_Details_Oucode_idx` ON `tblXLU_Occupation_Details` (`Oucode`);
CREATE UNIQUE INDEX `tblXLU_Occupation_Details_TitleRecordNumber_idx` ON `tblXLU_Occupation_Details` (`TitleRecordNumber`);

CREATE TABLE `tblXLU_States`
 (
	`State`			varchar, 
	`StateName`			varchar, 
	`Country`			varchar
);

-- CREATE INDEXES ...
CREATE UNIQUE INDEX `tblXLU_States_CountryState_idx` ON `tblXLU_States` (`Country`, `State`);
CREATE INDEX `tblXLU_States_State_idx` ON `tblXLU_States` (`State`);

CREATE TABLE `tblXLU_Titles`
 (
	`TitleID`			INTEGER, 
	`TitleDescription`			varchar, 
	`SortOrder`			INTEGER
	, PRIMARY KEY (`TitleID`)
);

-- CREATE INDEXES ...
CREATE INDEX `tblXLU_Titles_DepartmentID_idx` ON `tblXLU_Titles` (`TitleID`);
CREATE INDEX `tblXLU_Titles_SortOrder_idx` ON `tblXLU_Titles` (`SortOrder`);

CREATE TABLE `tblXLU_VIPR_Job_Descriptions`
 (
	`DOTCODE09`			varchar NOT NULL, 
	`JOBDESC`			TEXT
	, PRIMARY KEY (`DOTCODE09`)
);

-- CREATE INDEXES ...


