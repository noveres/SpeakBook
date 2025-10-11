export const environment = {
  production: true,
  api: {
    Account: {
      Login: {
        method: 'POST',
        url: 'api/Account/Login'
      },
      Logout: {
        method: 'POST',
        url: 'api/Account/Logout'
      },
      ExchangeAuthCode: {
        method: 'POST',
        url: 'api/Account/ExchangeAuthCode'
      },
      GoogleLogin: {
        method: 'GET',
        url: 'api/Account/GoogleLogin'
      },
      Profile: {
        method: 'GET',
        url: 'api/Account/Profile'
      },
      RefreshToken: {
        method: 'POST',
        url: 'api/Account/RefreshToken'
      },
      OAuthLogin: {
        method: 'POST',
        url: 'api/Account/OAuthLogin'
      },
      GetPermissionsByTree: {
        method: 'GET',
        url: 'api/Account/GetPermissionsByTree'
      }
    },
    LocationManagement:
    {
        Create:
        {
          method: 'POST',
          url: 'api/LocationManagement/Create'
        },
        GetByAdvancedQuery:
        {
          method: 'POST',
          url: 'api/LocationManagement/GetByAdvancedQuery'
        },
        GetIdLoc:
        {
          method: 'GET',
          url: '/api/LocationManagement/{id}'
        },
        DeleteIdLoc:
        {
           method: 'DELETE',
           url: 'api/LocationManagement/{id}'
        },
        Update:
        {
           method: 'PUT',
           url: 'api/LocationManagement/Update'
        }
    },
    CompanysManagement: {
      GetByAdvancedQuery: {
        method: 'POST',
        url: 'api/Management/CompanysManagement/GetByAdvancedQuery'
      },
      GetById: {
        method: 'GET',
        url: 'api/Management/CompanysManagement/GetById/{id}'
      },
      Create: {
        method: 'POST',
        url: 'api/Management/CompanysManagement/Create'
      },
      Update: {
        method: 'PUT',
        url: 'api/Management/CompanysManagement/Update'
      },
      Delete: {
        method: 'DELETE',
        url: 'api/Management/CompanysManagement/Delete/{id}'
      }
    },
    DepartmentManagement: {
      GetByAdvancedQuery: {
        method: 'POST',
        url: 'api/Management/DepartmentManagement/GetByAdvancedQuery'
      },
      GetById: {
        method: 'GET',
        url: 'api/Management/DepartmentManagement/GetById/{id}'
      },
      Create: {
        method: 'POST',
        url: 'api/Management/DepartmentManagement/Create'
      },
      Update: {
        method: 'PUT',
        url: 'api/Management/DepartmentManagement/Update'
      },
      Delete: {
        method: 'DELETE',
        url: 'api/Management/DepartmentManagement/Delete/{id}'
      }
    },
     UserManagement: {
      GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/UserManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/UserManagement/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/UserManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/UserManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/UserManagement/Delete/{id}'
       }
    },
    RoleManagement: {
      GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/RoleManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/RoleManagement/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/RoleManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/RoleManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/RoleManagement/Delete/{id}'
       },
       GetPermissionsByTree: {
         method: 'GET',
         url: 'api/Management/RoleManagement/GetPermissionsByTree/{roleId}'
       },
       UpdatePermissionsByTree: {
         method: 'POST',
         url: 'api/Management/RoleManagement/UpdatePermissionsByTree'
       },
       CreatePermissionsByTree: {
         method: 'POST',
         url: 'api/Management/RoleManagement/CreatePermissionsByTree'
       },
     },
     ParametersManagement: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/ParametersManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/ParametersManagement/GetById/{id}'
       },
       GetByItemKey: {
         method: 'GET',
         url: 'api/Management/ParametersManagement/GetByItemKey/{itemKey}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/ParametersManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/ParametersManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/ParametersManagement/Delete/{id}'
       }
     },
     SourceManagement: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/SourceManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/SourceManagement/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/SourceManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/SourceManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/SourceManagement/Delete/{id}'
       }
     },
     StatusManagement: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/StatusManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/StatusManagement/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/StatusManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/StatusManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/StatusManagement/Delete/{id}'
       }
     },
     UnitsManagement: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/UnitsManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/UnitsManagement/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/UnitsManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/UnitsManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/UnitsManagement/Delete/{id}'
       }
     },
     ItemCate1Management: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/ItemCate1Management/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/ItemCate1Management/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/ItemCate1Management/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/ItemCate1Management/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/ItemCate1Management/Delete/{id}'
       }
     },
     ItemCate2Management: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/ItemCate2Management/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/ItemCate2Management/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/ItemCate2Management/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/ItemCate2Management/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/ItemCate2Management/Delete/{id}'
       },
       GetByItemCate1Id: {
         method: 'GET',
         url: 'api/Management/ItemCate2Management/GetByItemCate1Id/{itemCate1Id}'
       }
     },
     ItemCate3Management: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/ItemCate3Management/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/ItemCate3Management/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/ItemCate3Management/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/ItemCate3Management/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/ItemCate3Management/Delete/{id}'
       },
       GetByItemCate2Id: {
         method: 'GET',
         url: 'api/Management/ItemCate3Management/GetByItemCate2Id/{itemCate2Id}'
       }
     },
     AssetManagement: {
       GetByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/AssetManagement/GetByAdvancedQuery'
       },
       GetById: {
         method: 'GET',
         url: 'api/Management/AssetManagement/GetById/{id}'
       },
       Create: {
         method: 'POST',
         url: 'api/Management/AssetManagement/Create'
       },
       Update: {
         method: 'PUT',
         url: 'api/Management/AssetManagement/Update'
       },
       Delete: {
         method: 'DELETE',
         url: 'api/Management/AssetManagement/Delete/{id}'
       },
       GetAssetWithDetailsByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/AssetManagement/GetAssetWithDetailsByAdvancedQuery'
       },
        GetAssetWithDetailsByAdvancedQuery2: {
         method: 'POST',
         url: 'api/Management/AssetManagement/GetAssetWithDetailsByAdvancedQuery2'
       },
       CreateDetail: {
         method: 'POST',
         url: 'api/Management/AssetManagement/CreateDetail'
       },
       UpdateDetail: {
         method: 'PUT',
         url: 'api/Management/AssetManagement/UpdateDetail'
       },
       DeleteDetail: {
         method: 'DELETE',
         url: 'api/Management/AssetManagement/DeleteDetail/{id}'
       },
       Allocation: {
         method: 'POST',
         url: 'api/Management/AssetManagement/Allocation'
       },
       GetAllocationLog: {
         method: 'GET',
         url: 'api/Management/AssetManagement/AllocationLog/{assetDetailId}'
       },
      PropertyCatalog:{
          method: 'POST',
          url: 'api/Management/AssetManagement/PropertyCatalog'
      },
      ExportPropertyCatalog: {
        method: 'POST',
        url: 'api/Management/AssetManagement/ExportPropertyCatalog'
      },
      GetAssetReport: {
        method: 'POST',
        url: 'api/Management/AssetManagement/GetAssetReport',
      },
      ExportAssetReport: {
        method: 'POST',
        url: 'api/Management/AssetManagement/ExportAssetReport'
      },
     DepreciationWrite: {  //折舊計算
        method: 'POST',
        url: 'api/Management/AssetManagement/DepreciationWrite'
      },
      DepreciationSimulation: {  //折舊試試算
        method: 'POST',
        url: 'api/Management/AssetManagement/DepreciationSimulation'
      },
      ChangeAssetStatus: {
        method: 'POST',
        url: 'api/Management/AssetManagement/ChangeAssetStatus'
      },
      GetAssetStatusLog: {
        method: 'GET',
        url: 'api/Management/AssetManagement/GetAssetStatusLog/{assetDetailId}'
      },
     },
     InventoryManagement: {
       CreateSlip: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/CreateSlip'
       },
       UpdateSlip: {
         method: 'PUT',
         url: 'api/Management/InventoryManagement/UpdateSlip'
       },
       DeleteSlip: {
         method: 'DELETE',
         url: 'api/Management/InventoryManagement/DeleteSlip/{id}'
       },
       GetSlipByAdvancedQuery: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/GetSlipsByAdvancedQuery'
       },
       GetAvailableLocations: {
         method: 'GET',
         url: 'api/Management/InventoryManagement/GetAvailableLocations'
       },
       GetAssetsByLocationIds: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/GetAssetsByLocationIds'
       },
       CreateAssets: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/CreateAssets'
       },
       CreateReInventory: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/CreateReInventory'
       },
       CreateAssetsBatch: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/CreateAssetsBatch'
       },
       CreateFullInventory: {
         method: 'POST',
         url: 'api/Management/InventoryManagement/CreateFullInventory'
       },
       GetInventoryResult: {
         method: 'GET',
         url: 'api/Management/InventoryManagement/inventory-results/{inventorySlipId}'
       },
     },
     InventoryReport: {
      InventoryReport: {
        method: 'POST',
        url: 'api/InventoryReport/export-inventory-results'
      }
    },
    AssetStatusReport: {
      AssetStatusReport: {
        method: 'POST',
        url: 'api/Management/AssetStatusReport/GetAssetStatusReport'
      },
      AssetStatusReportExport: {
        method: 'POST',
        url: 'api/Management/AssetStatusReport/export'
      },
      AssetStatusReportList: {
        method: 'POST',
        url: 'api/Management/AssetStatusReport/list'
      }
    },
    AssetStatusReportExport: {
      method: 'POST',
      url: 'api/Management/AssetStatusReport/export'
    },
    InventoryApp: {
      InventoryApp: {
        method: 'POST',
        url: 'api/app/InventoryApp/upload-results'
      },
      closeInventorySlip: {
        method: 'DELETE',
        url: '/api/app/InventoryApp/close-inventory-slip/{inventorySlipId}'
      }
    },
  assetsRevaluation: {
      Create: {
        method: 'POST',
        url: 'api/Management/assetsRevaluation/Create'
      },
      GetByAdvancedQuery: {
        method: 'POST',
        url: 'api/Management/assetsRevaluation/GetByAdvancedQuery'
      },
      GetById: {
        method: 'GET',
        url: 'api/Management/assetsRevaluation/{id}'
      },
      Update: {
        method: 'PUT',
        url: 'api/Management/assetsRevaluation/Update'
      },
      Delete: {
        method: 'DELETE',
        url: 'api/Management/assetsRevaluation/Delete/{id}'
      }
    }
  }
};
