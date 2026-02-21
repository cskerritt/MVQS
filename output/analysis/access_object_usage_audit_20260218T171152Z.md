# Access Object Usage Audit

- Generated (UTC): 2026-02-18T17:11:52Z
- Front-end: `/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnd_with_Adobe.accdb`
- VBA source text: `/Users/chrisskerritt/Downloads/MVQS/output/analysis/access_audit_tmp/vba_text_from_docx.txt`

## Inventory

- Modules: 9
- Reports: 107
- Queries (all): 911
- Queries (canonical): 836
- Queries (hidden `~sq_`): 75

## Static Evidence Signals

- Modules name-matched in VBA text: 0
- Reports name-matched in VBA text: 0
- Reports name-matched in hidden Access queries: 20
- Canonical queries found in VBA quoted strings: 29
- Canonical queries name-matched in VBA text: 29
- Canonical queries referenced by other saved queries: 25
- Legacy object names found in modern workspace text: 0

## Coverage Snapshot

- Static analysis can prove some objects are referenced, but cannot prove non-referenced objects are unused at runtime.
- Access forms/macros/event handlers can invoke objects without clean string traces in exported artifacts.

### Modules without VBA name match (possible false negatives)

- modAPI_Calls
- modAccessWindowsUtilities
- modApplication Shared - Functions
- modAutoExec Functions and Globals
- modCombine_Files_Functions
- modCombine_Files_Functions_with_Adobe
- modErrorHandler
- modMVQS Functions
- modOpenFile

### Reports without static signal (possible false negatives)

- rptAverage_Worker_Traits
- rptCombine_01_Title_Page
- rptCombine_02_Table_of_Contents_Sub_Chapters_Sub
- rptDatabaseUsers
- rptDatabase_Issues_Rpt_NoData
- rptEvaluee_Current_Jobs
- rptEvaluee_Identification_OLD
- rptEvaluee_Job_Opportunity
- rptEvaluee_Pre_Post_Comparisons_OLD
- rptEvaluee_Values_and_Needs_OLD
- rptEvaluee_Worker_Trait_Profiles_OLD
- rptHousehold_Chores
- rptMTSP_01_Evaluee_Identification
- rptMTSP_02_Evaluee_Values_and_Needs
- rptMTSP_05_Work_History_by_DOTs_Traits
- rptMTSP_05_Work_History_by_DOTs_Traits_PV
- rptMTSP_06_Work_History_by_Crosswalks
- rptMTSP_06_Work_History_by_Crosswalks_PV
- rptMTSP_075_Work_History_by_EC_With_US_BLS
- rptMTSP_07_Work_History_by_EC
- rptMTSP_07_Work_History_by_EC_PV
- rptMTSP_08_Job_Matches_By_EC
- rptMTSP_08_Job_Matches_By_EC_PopUp
- rptMTSP_09_Job_Matches_By_TS_Crosswalks
- rptMTSP_09_Job_Matches_By_TS_Crosswalks_PopUp
- rptMTSP_10_Job_Matches_By_TS_EC
- rptMTSP_10_Job_Matches_By_TS_EC_PopUp
- rptMTSP_11_Job_Matches_by_Value_Traits_Rpt
- rptMTSP_11_Job_Matches_by_Value_Traits_Rpt_PopUp
- rptMTSP_12_Job_Matches_by_Value_Crosswalks_Rpt
- rptMTSP_12_Job_Matches_by_Value_Crosswalks_Rpt_PopUp
- rptMTSP_13_Job_Matches_by_Value_EC_Rpt
- rptMTSP_13_Job_Matches_by_Value_EC_Rpt_PopUp
- rptMTSP_14_Job_Match_VQ_Traits
- rptMTSP_14_Job_Match_VQ_Traits_PopUp
- rptMTSP_15_Job_Match_VQ_Crosswalks
- rptMTSP_15_Job_Match_VQ_Crosswalks_PopUp
- rptMTSP_16_Job_Match_VQ_EC
- rptMTSP_16_Job_Match_VQ_EC_PopUp
- rptMTSP_17_Job_Match_SVP_Traits
- rptMTSP_17_Job_Match_SVP_Traits_PopUp
- rptMTSP_18_Job_Match_SVP_Crosswalks
- rptMTSP_18_Job_Match_SVP_Crosswalks_PopUp
- rptMTSP_19_Job_Match_SVP_EC
- rptMTSP_19_Job_Match_SVP_EC_PopUp
- rptMTSP_20_Job_Matches_VIPR_Traits
- rptMTSP_20_Job_Matches_VIPR_Traits_PopUp
- rptMTSP_21_Job_Matches_VIPR_Crosswalks
- rptMTSP_21_Job_Matches_VIPR_Crosswalks_BAD
- rptMTSP_21_Job_Matches_VIPR_Crosswalks_PopUp
- rptMTSP_22_Job_Matches_VIPR_EC_Values
- rptMTSP_22_Job_Matches_VIPR_EC_Values_Bad
- rptMTSP_22_Job_Matches_VIPR_EC_Values_PopUp
- rptMcDOT_01_Job_Definitions
- rptMcDOT_02_Complete
- rptMcDOT_03_Crosswalks
- rptMcDOT_04_24SignificantTraits
- rptMcDOT_05_Occupational_Reinforcers
- rptMcDOT_24SignificantTraits_OLD
- rptMcDOT_Complete_OLD

### Canonical queries without static signal (possible false negatives)

- QryAverage_Worker_Traits
- Query1
- Query10
- Query11
- Query12
- Query13
- Query14
- Query15
- Query16
- Query17
- Query18
- Query19
- Query2
- Query20
- Query21
- Query22
- Query3
- Query4
- Query5
- Query6
- Query7
- Query8
- Query9
- qryAptitudeLevels_DDLB
- qryClient_APPEND_WHE_pCompany_Name
- qryClients_DDLB
- qryClients_DDLB_WHE_Evaluees
- qryClients_SORTED
- qryClients_UPDATE_Name_WHE_pCompany_Names
- qryClients_WHE_FOR_MM_SB_Client_Name
- qryClients_WHE_FOR_frmClients_SB_NameID
- qryClients_WHE_pCompany_Name
- qryCompanies_WHE_FOR_frmCompanies_SB_TypeID
- qryCounties_DDLB
- qryCounties_DDLB_WHE_FOR_frm_Evaluees_State
- qryCounties_DDLB_WHE_FOR_frm_Evaluees_State_W
- qryCounties_DDLB_WHE_FOR_frm_QEvaluees_State
- qryCounties_DDLB_WHE_FOR_frm_QEvaluees_State_W
- qryCounties_SUMMARY
- qryCounties_WHE_Dans
- qryCounties_WHE_pCountry_pState
- qryCountries_DDLB
- qryDOT_SUMMARY_SUMMARY
- qryDOT_WHE_Keyword
- qryDatabaseTypes_DDLB
- qryDatabaseTypes_SORTED
- qryDatabaseUsers_Company_Name_DDLB
- qryDatabaseUsers_DDLB
- qryDatabaseUsers_DDLB_WHE_Active
- qryDatabaseUsers_DDLB_WHE_TechSupport
- qryDatabaseUsers_LAN_Login_DDLB
- qryDatabaseUsers_Listing_Rpt
- qryDatabaseUsers_Rpt
- qryDatabaseUsers_SORTED
- qryDatabaseUsers_SORT_BY_SecurityLevel
- qryDatabaseUsers_WHE_Active
- qryDatabaseUsers_WHE_FOR_frmDatabaseUsers_SB_LANLogin
- qryDatabaseUsers_WHE_FOR_frmDatabaseUsers_SB_Name
- qryDatabaseUsers_WHE_pComputerName
- qryDatabaseUsers_WHE_pLANLogin
- qryDepartments_DDLB
- qryDepartments_SORTED
- qryECLR_Constants
- qryECLR_Constants_1
- qryECLR_Constants_2
- qryECLR_Constants_3
- qryECLR_Constants_4
- qryEvaluee_Analysis_50_UPT_Eval_Prof_OneHundredth_WHE_pPersonID
- qryEvaluee_Household_Chore_Occupations_DELETE_WHE_pPersonID
- qryEvaluee_Household_Chores_CALC_Avg_WHE_pPersonID
- qryEvaluee_Household_Chores_DELETE_WHE_pPersonID
- qryEvaluee_Household_Chores_Occupations_SORTED
- qryEvaluee_Household_Chores_Rpt
- qryEvaluee_Job_Count_WHE_pPersonID
- qryEvaluee_Job_Market_Rpt_Annual_Summary_WHE_pPersonID
- qryEvaluee_Job_Market_Rpt_Annual_Summary_WHE_pPersonID_pJTS
- qryEvaluee_Job_Market_Rpt_Hourly_Summary_WHE_pPersonID
- qryEvaluee_Job_Market_Rpt_Hourly_Summary_WHE_pPersonID_pJTS
- qryEvaluee_Job_Market_Rpt_WHE_Active
- qryEvaluee_Job_Market_Rpt__SUM_WHE_pPersonID
- qryEvaluee_Jobs_APPEND_WHE_ALL
- qryEvaluee_Jobs_Avg_Rate_WHE_pPersonID_No_Zeros
- qryEvaluee_Jobs_Companies_DDLB
- qryEvaluee_Jobs_Companies_DDLB_WHE_PersonID
- qryEvaluee_Jobs_DELETE_WHE_pPersonID
- qryEvaluee_Jobs_Location_DDLB_WHE_PersonID
- qryEvaluee_Jobs_Opportunity_Rpt
- qryEvaluee_Jobs_RVW_WHE_SB_PersonID_Company
- qryEvaluee_Jobs_RVW_WHE_SB_PersonID_Job_Title_Search
- qryEvaluee_Jobs_RVW_WHE_SB_PersonID_Location
- qryEvaluee_Jobs_RVW_WHE_SB_Person_ID_Job_Site
- qryEvaluee_Jobs_SUMMARY
- qryEvaluee_Jobs_Site_DDLB
- qryEvaluee_Jobs_Site_DDLB_WHE_PersonID
- qryEvaluee_Jobs_Title_DDLB
- qryEvaluee_Jobs_Title_Search_DDLB
- qryEvaluee_Jobs_Title_Search_DDLB_WHE_pPersonID
- qryEvaluee_Jobs_UPDATE_Remote
- qryEvaluee_Jobs_UPDATE_WHE_pPersonID
- qryEvaluee_Jobs_WHE_FOR_Eval_SB_Job_Site
- qryEvaluee_Jobs_WHE_FOR_Eval_SB_Job_Site_BAD
- qryEvaluee_Jobs_WHE_FOR_Eval_SB_Job_Title
- qryEvaluee_Jobs_WHE_FOR_Eval_SB_Job_Title_Search
- qryEvaluee_Jobs_WHE_FOR_frmEvaluees_PersonID
- qryEvaluee_Jobs_WHE_SB_PersonID_Company
- qryEvaluee_Jobs_WHE_SB_PersonID_Job_Title
- qryEvaluee_Jobs_WHE_SB_PersonID_Job_Title_Search
- qryEvaluee_Jobs_WHE_SB_Person_ID_Job_Site
- qryEvaluee_Jobs_WHE_SB_Person_ID_Remote_Jobs
- qryEvaluee_Jobs_WHE_pEvaluee_Job_ID
- qryEvaluee_MCDOT_Analysis_70_Profile_Master_DEL_WHE_pPersonID
- qryEvaluee_MCDOT_Analysis_71_Profile_Master_APP_WHE_Work_History
- qryEvaluee_MCDOT_Analysis_72_Profile_Master_UPD_WHE_Evaluative
- qryEvaluee_MCDOT_Analysis_73_Profile_Master_UPD_WHE_PreInjury
- qryEvaluee_MCDOT_Analysis_74_Profile_Master_UPD_WHE_PostInjury
- qryEvaluee_MTSP_Client_Identification_Rpt
- qryEvaluee_MTSP_Identification_Rpt
- qryEvaluee_MTSP_Synthesize_10_APP_Occupations_
- qryEvaluee_McDOT_Analysis_02_DEL_All_Profiles_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_04_DEL_WorkHistValues_WHE_pPersonID

## Key Conclusion

- The modern MVQS app currently imports data from `MVQS_DC_Data.accdb` and `MVQS_DC_Data_JobBank.accdb`; it does not directly execute Access VBA modules, saved Access queries, or Access report objects.
