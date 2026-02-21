# Access Object Usage Audit

- Generated (UTC): 2026-02-18T17:18:16Z
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
- Modules name-matched in Access storage (non-DirData): 9
- Reports name-matched in Access storage (non-DirData): 105
- Canonical queries name-matched in Access storage (non-DirData): 636
- Legacy object names found in modern workspace text: 0

## Accounting

- Modules unaccounted: 0
- Reports unaccounted: 2
- Canonical queries unaccounted: 195

## Coverage Snapshot

- Static analysis can prove some objects are referenced, but cannot prove non-referenced objects are unused at runtime.
- Access storage matches prove object presence in the Access file internals, not guaranteed end-user execution paths.

### Modules without VBA name match (possible false negatives)


### Reports still unaccounted (possible false negatives)

- rptMTSP_21_Job_Matches_VIPR_Crosswalks_BAD
- rptMTSP_22_Job_Matches_VIPR_EC_Values_Bad

### Canonical queries still unaccounted (possible false negatives)

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
- Query9
- qryClients_WHE_FOR_frmClients_SB_NameID
- qryCompanies_WHE_FOR_frmCompanies_SB_TypeID
- qryCounties_SUMMARY
- qryCounties_WHE_Dans
- qryDOT_SUMMARY_SUMMARY
- qryDOT_WHE_Keyword
- qryDatabaseTypes_DDLB
- qryDatabaseUsers_DDLB_WHE_Active
- qryDatabaseUsers_Listing_Rpt
- qryDatabaseUsers_WHE_pComputerName
- qryDepartments_DDLB
- qryEvaluee_Household_Chore_Occupations_DELETE_WHE_pPersonID
- qryEvaluee_Job_Market_Rpt__SUM_WHE_pPersonID
- qryEvaluee_Jobs_Avg_Rate_WHE_pPersonID_No_Zeros
- qryEvaluee_Jobs_SUMMARY
- qryEvaluee_Jobs_Title_DDLB
- qryEvaluee_Jobs_WHE_FOR_Eval_SB_Job_Site_BAD
- qryEvaluee_Jobs_WHE_pEvaluee_Job_ID
- qryEvaluee_MTSP_Synthesize_10_APP_Occupations_
- qryEvaluee_McDOT_Analysis_17_APP_TestScoresDTLS_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_02_UPD_EP_GEDM1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_03_UPD_EP_GEDL1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_07_UPD_EP_APTS1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_08_UPD_EP_APTP1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_09_UPD_EP_APTQ1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_10_UPD_EP_APTK1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_11_UPD_EP_APTF1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_20_12_UPD_EP_APTM1_WHE_pPersonID
- qryEvaluee_McDOT_Analysis_25_UPD_Rating_WHE_pPersonID_AP7_DEF
- qryEvaluee_McDOT_Analysis_25_UPD_Rating_WHE_pPersonID_AP8_DEF
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD1_DANS
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD1_DEF
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD2_DEF
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD3_DEF
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD4_DEF
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD5_DEF
- qryEvaluee_McDOT_Analysis_26_UPD_Rating_WHE_pPersonID_PD6_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC1_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC2_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC3_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC4_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC5_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC6_DEF
- qryEvaluee_McDOT_Analysis_27_UPD_Rating_WHE_pPersonID_EC7_DEF
- qryEvaluee_Occupations_WHE_Dans
- qryEvaluee_Post_Jobs_SORTED
- qryEvaluee_Pre_Jobs_SORTED
- qryEvaluee_Pre_Jobs_WHE_DANS
- qryEvaluee_Profiles_UPDATE_Trait_WHE_pPersonID_pValue
- qryEvaluee_Quantify_10_APP_Job_Bank_Details_DANS
- qryEvaluee_Quantify_14_APP_Select_Pre_Jobs_WHE_pPerso_DANS
- qryEvaluee_Quantify_64_APP_Select_Post_Jobs_WHE_pPersonID_DANS
- qryEvaluee_Quantify_81_APP_Post_ECLR_WHE_Dans
- qryEvaluee_Quantify_84_UPT_WH_ECLR_WHE_pPersonID_DANS
- qryEvaluee_Quantify_99_03_APP_Pre_TSP_Levels_WHE_pPersonID_BAD
- qryEvaluee_Quantify_99_06_UPD_EStats_Pre_TSP_WHE_pPersonID_DANS
- qryEvaluee_Ratings_DELETE_WHE_DANS
- qryEvaluee_Ratings_SORTED_DANs
- qryEvaluee_Ratings_SUMMARY_WHE_DANS
- qryEvaluee_Ratings_WHE_DANS
- qryEvaluee_Reports_Menu_PV
- qryEvaluee_Rpt_Table_of_Contents_WHE_Dans
- qryEvaluee_Test_Results_DELETE_DANS
- qryEvaluee_Test_Results_WHE_DANS
- qryEvaluee_Values_Rpt2
- qryHHCO_12_Quantify_12_APP_Job_Banks_Summary_DANS
- qryHHCO_Quantify_64_APP_Select_Post_Jobs_WHE_0
- qryHHCO_Quantify_64_APP_Select_Post_Jobs_WHE_0_Dans
- qryHHCO_Quantify_64_APP_Select_Post_Jobs_WHE_0_Dans2
- qryHousehold_Chore_Categories_SORTED
- qryHousehold_Chore_Items_SORTED
- qryIMPORT_USBSL_ALL_10_UPDATE_Import_Info
- qryIMPORT_USBSL_ALL_20_UPDATE_H_Mean_HIGH
- qryIMPORT_USBSL_ALL_21_UPDATE_A_Mean_HIGH
- qryIMPORT_USBSL_ALL_22_UPDATE_H_PCT10_HIGH
- qryIMPORT_USBSL_ALL_22_UPDATE_H_PCT25_HIGH
- qryIMPORT_USBSL_ALL_23_UPDATE_H_MEDIAN_HIGH
- qryIMPORT_USBSL_ALL_24_UPDATE_H_PCT75_HIGH
- qryIMPORT_USBSL_ALL_25_UPDATE_H_PCT90_HIGH
- qryIMPORT_USBSL_ALL_26_UPDATE_A_PCT10_HIGH
- qryIMPORT_USBSL_ALL_27_UPDATE_A_PCT25_HIGH
- qryIMPORT_USBSL_ALL_28_UPDATE_A_MEDIAN_HIGH
- qryIMPORT_USBSL_ALL_29_UPDATE_A_PCT75_HIGH
- qryIMPORT_USBSL_ALL_30_UPDATE_A_PCT90_HIGH
- qryIMPORT_USBSL_ALL_50_DELETE
- qryIMPORT_USBSL_ALL_60_DELETE
- qryIMPORT_USBSL_All_52_APPEND_FROM_IMPORT
- qryIMPORT_USBSL_OES_10_UPDATE_A_PCT90_Astericks
- qryIMPORT_USBSL_OES_20_UPDATE_H_MEAN_Astericks
- qryIMPORT_USBSL_OES_21_UPDATE_A_MEAN_Astericks
- qryIMPORT_USBSL_OES_22_UPDATE_H_PCT10_Astericks
- qryIMPORT_USBSL_OES_23_UPDATE_H_PCT25_Astericks
- qryIMPORT_USBSL_OES_24_UPDATE_H_MEDIAN_Astericks
- qryIMPORT_USBSL_OES_25_UPDATE_H_PCT75_Astericks
- qryIMPORT_USBSL_OES_26_UPDATE_H_PCT90_Astericks
- qryIMPORT_USBSL_OES_27_UPDATE_A_PCT10_Astericks
- qryIMPORT_USBSL_OES_28_UPDATE_A_PCT25_Astericks
- qryIMPORT_USBSL_OES_29_UPDATE_A_MEDIAN_Astericks
- qryIMPORT_USBSL_OES_30_UPDATE_A_PCT75_Astericks

## Key Conclusion

- The modern MVQS app currently imports data from `MVQS_DC_Data.accdb` and `MVQS_DC_Data_JobBank.accdb`; it does not directly execute Access VBA modules, saved Access queries, or Access report objects.
