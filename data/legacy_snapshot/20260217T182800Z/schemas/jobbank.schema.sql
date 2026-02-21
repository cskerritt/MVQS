-- ----------------------------------------------------------
-- MDB Tools - A library for reading MS Access database files
-- Copyright (C) 2000-2011 Brian Bruns and others.
-- Files in libmdb are licensed under LGPL and the utilities under
-- the GPL, see COPYING.LIB and COPYING files respectively.
-- Check out http://mdbtools.sourceforge.net
-- ----------------------------------------------------------

-- That file uses encoding UTF-8

CREATE TABLE `tblJob_Bank`
 (
	`CountryID`			INTEGER, 
	`StateID`			INTEGER, 
	`CountyNumber`			INTEGER, 
	`DOTCODE09`			varchar, 
	`State`			varchar
);

-- CREATE INDEXES ...
CREATE INDEX `tblJob_Bank_CountryID_idx` ON `tblJob_Bank` (`CountryID`);
CREATE INDEX `tblJob_Bank_CountyID_idx` ON `tblJob_Bank` (`CountyNumber`);
CREATE INDEX `tblJob_Bank_DOTCODE09_idx` ON `tblJob_Bank` (`DOTCODE09`);
CREATE INDEX `tblJob_Bank_State_idx` ON `tblJob_Bank` (`State`);
CREATE INDEX `tblJob_Bank_StateID_idx` ON `tblJob_Bank` (`StateID`);


