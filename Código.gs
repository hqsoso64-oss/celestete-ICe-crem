var SPREADSHEET_ID = "TU_ID_DE_GOOGLE_SHEETS_AQUI"; // IMPORTANTE: Reemplaza esto con el ID real de tu hoja de cálculo de Google.
// El ID se encuentra en la URL de tu hoja: https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
var CACHE_TIME = 1500;

function doGet() { return HtmlService.createHtmlOutputFromFile('Index').setTitle('Celeste POS').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }

// LOGS
function logAction(action, detail, user) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Logs");
    if (!sheet) { ss.insertSheet("Logs").appendRow(["FECHA","EMAIL","USUARIO","ACCIÓN","DETALLE"]); sheet.hideSheet(); }
    sheet.appendRow([new Date(), Session.getActiveUser().getEmail(), user||"?", action, detail]);
  } catch(e){}
}
function onGlobalEdit(e) { if(e && e.range.getSheet().getName()!=="Logs") logAction("CAMBIO_MANUAL", e.range.getA1Notation()+" -> "+e.value, "MANUAL"); }

// DASHBOARD
function getDashboardData() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var inv = ss.getSheetByName("Inventario").getDataRange().getValues();
    var low = [];
    for(var i=1; i<inv.length; i++) {
      if(parseFloat(inv[i][2]) <= parseFloat(inv[i][5])) low.push({name: inv[i][1], stockActual: inv[i][2], stockMinimo: inv[i][5]});
    }
    
    var sales = ss.getSheetByName("Ventas").getDataRange().getValues();
    var today = new Date();
    var salesTodayCount=0, salesMonthCount=0, revToday=0, revMonth=0;
    var mesa=0, llevar=0;
    var payMethods = {"EFECTIVO":0,"NEQUI":0,"BANCOLOMBIA":0,"TARJETA":0};
    
    var uniqueSalesToday = {};
    var uniqueSalesMonth = {};
    
    for(var i=1; i<sales.length; i++) {
      var d = new Date(sales[i][1]); 
      var id = sales[i][0];
      var amt = parseFloat(sales[i][5])||0;
      
      if(d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear()) {
        if(!uniqueSalesMonth[id]) { salesMonthCount++; uniqueSalesMonth[id]=true; }
        revMonth += amt;
        
        if(d.getDate()===today.getDate()) {
          if(!uniqueSalesToday[id]) { 
             salesTodayCount++; uniqueSalesToday[id]=true; 
             if(sales[i][6]==="MESA") mesa++; else llevar++;
          }
          revToday += amt;
          var pm = sales[i][7];
          if(payMethods[pm]!==undefined) payMethods[pm]+=amt;
        }
      }
    }
    
    var exp = ss.getSheetByName("Gastos").getDataRange().getValues();
    var expMonth = 0;
    for(var i=1; i<exp.length; i++) {
      var d = new Date(exp[i][1]);
      if(d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear()) {
        expMonth += (parseFloat(exp[i][3])||0);
      }
    }
    
    return {
      inventoryCount: inv.length-1,
      lowStockProducts: low,
      todaySalesCount: salesTodayCount,
      todayRevenue: formatMoney(revToday),
      monthSalesCount: salesMonthCount,
      monthRevenue: formatMoney(revMonth),
      monthExpenses: formatMoney(expMonth),
      todayMesaCount: mesa,
      todayLlevarCount: llevar,
      paymentMethodsToday: {
        "EFECTIVO": formatMoney(payMethods.EFECTIVO), "NEQUI": formatMoney(payMethods.NEQUI),
        "BANCOLOMBIA": formatMoney(payMethods.BANCOLOMBIA), "TARJETA": formatMoney(payMethods.TARJETA)
      }
    };
  } catch(e) { throw e; }
}

// POS
function getProducts() {
  var c = CacheService.getScriptCache();
  var cached = c.get("prod_final_v8");
  if(cached) return JSON.parse(cached);
  var data = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Productos").getDataRange().getValues();
  var list = [];
  for(var i=1; i<data.length; i++) {
    if(data[i][11]=="ELIMINADO") continue;
    list.push({id:data[i][0], name:data[i][1], PRECIO_MESA:parseFloat(data[i][2])||0, PRECIO_LLEVAR:parseFloat(data[i][3])||0, CANTIDAD_BOLAS:parseInt(data[i][6])||0, INGREDIENTES_NECESARIOS:data[i][7]});
  }
  c.put("prod_final_v8", JSON.stringify(list), CACHE_TIME);
  return list;
}
function getFlavors() {
  var d = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Sabores de Helados").getDataRange().getValues();
  return d.slice(1).map(r => ({name:r[1]}));
}
function registerSale(s) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var shV = ss.getSheetByName("Ventas");
  var shI = ss.getSheetByName("Inventario");
  var id = "VENTA-"+Date.now();
  s.items.forEach(it => {
    shV.appendRow([id, new Date(), it.name, it.qty, it.price, it.total, s.type, s.payMethod, it.flavors.join(','), 0, s.user]);
    if(it.product.INGREDIENTES_NECESARIOS) {
      it.product.INGREDIENTES_NECESARIOS.split(',').forEach(p => {
        var [code, q] = p.split(':');
        updateStock(shI, code, parseFloat(q)*it.qty);
      });
    }
  });
  logAction("VENTA", "Total: "+s.items.reduce((a,b)=>a+b.total,0), s.user);
}
function updateStock(sh, id, qty) {
  var d = sh.getDataRange().getValues();
  for(var i=1; i<d.length; i++) {
    if(d[i][0]==id.trim()) {
      sh.getRange(i+1, 3).setValue((parseFloat(d[i][2])||0) - qty);
      break;
    }
  }
}

// REPORTES
function getSalesReport(sStr, eStr) {
  var d = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Ventas").getDataRange().getValues();
  var start = new Date(sStr).setHours(0,0,0,0);
  var end = new Date(eStr).setHours(23,59,59,999);
  var res = [];
  for(var i=1; i<d.length; i++) {
    var dt = new Date(d[i][1]);
    if(dt.getTime() >= start && dt.getTime() <= end) {
      res.push({"FECHA": formatDate(dt), "PRODUCTO": d[i][2], "CANTIDAD": d[i][3], "TOTAL": parseFloat(d[i][5])||0, "PAGO": d[i][7], "USUARIO": d[i][10]});
    }
  }
  return res;
}
function getExpenseReport(sStr, eStr) {
  var d = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Gastos").getDataRange().getValues();
  var start = new Date(sStr).setHours(0,0,0,0);
  var end = new Date(eStr).setHours(23,59,59,999);
  var res = [];
  for(var i=1; i<d.length; i++) {
    var dt = new Date(d[i][1]);
    if(dt.getTime() >= start && dt.getTime() <= end) {
      res.push({"FECHA": formatDate(dt), "DESC": d[i][2], "MONTO": parseFloat(d[i][3])||0, "CATEGORIA": d[i][4]});
    }
  }
  return res;
}

// CRUD INVENTARIO (VALIDACIÓN DUPLICADOS + CREACIÓN PRODUCTO + BORRADO SINCRONIZADO)
function getInventoryData() {
  var d = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Inventario").getDataRange().getValues();
  return d.slice(1).map(r => ({id:r[0], name:r[1], stock:r[2], unit:r[3], min:r[5]}));
}

function addInventory(o) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName("Inventario");
  var data = sh.getDataRange().getValues();
  var nameToClean = o.name.toLowerCase().trim();
  
  // Validar Duplicado en Inventario
  for(var i=1; i<data.length; i++) {
    var rowName = data[i][1].toString().toLowerCase().trim();
    if(rowName === nameToClean && data[i][6] !== "ELIMINADO") {
       throw new Error("¡Error! El insumo '" + o.name + "' ya existe.");
    }
  }
  
  var newId = 'ING' + Date.now();
  sh.appendRow([newId, o.name, o.stock, o.unit, 0, o.min]);
  
  // Crear en Productos si se marcó
  if(o.addToProducts) {
    var shProd = ss.getSheetByName("Productos");
    var recipe = newId + ":1"; 
    shProd.appendRow([newId, o.name, o.priceMesa, o.priceLlevar, 0, "NO_APLICA", 0, recipe, "General", recipe, "", "ACTIVO"]);
    CacheService.getScriptCache().remove("prod_final_v8");
  }
  
  logAction("ADD_INV", o.name + (o.addToProducts ? " (+PROD)" : ""), o.user);
}

function updateInventory(o) {
  var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Inventario");
  var data = sh.getDataRange().getValues();
  var nameToClean = o.name.toLowerCase().trim();
  
  for(var i=1; i<data.length; i++) {
    var rowName = data[i][1].toString().toLowerCase().trim();
    if(rowName === nameToClean && data[i][0] !== o.id && data[i][6] !== "ELIMINADO") {
       throw new Error("¡Error! Nombre duplicado.");
    }
  }

  for(var i=1; i<data.length; i++) {
    if(data[i][0]==o.id) { sh.getRange(i+1, 2).setValue(o.name); sh.getRange(i+1, 3).setValue(o.stock); break; }
  }
  logAction("EDIT_INV", o.name, o.user);
}

function deleteInventory(id, user) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Borrar de Inventario (Físico)
  var shInv = ss.getSheetByName("Inventario");
  var dataInv = shInv.getDataRange().getValues();
  var deletedName = "";
  
  for(var i=1; i<dataInv.length; i++) { 
    if(dataInv[i][0] == id) { 
      deletedName = dataInv[i][1];
      shInv.deleteRow(i+1); 
      break; 
    } 
  }
  
  // 2. Borrar de Productos (Sincronización - Soft Delete)
  var shProd = ss.getSheetByName("Productos");
  var dataProd = shProd.getDataRange().getValues();
  var prodDeleted = false;
  
  for(var j=1; j<dataProd.length; j++) {
    if(dataProd[j][0] == id) {
       shProd.getRange(j+1, 12).setValue("ELIMINADO");
       prodDeleted = true;
       break;
    }
  }
  
  if(prodDeleted) CacheService.getScriptCache().remove("prod_final_v8");

  logAction("DEL_INV", "ID: " + id + " (" + deletedName + ")" + (prodDeleted ? " [+PROD]" : ""), user);
}

// OTROS CRUD
function getExpensesHistory() {
  var d = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Gastos").getDataRange().getValues();
  return d.slice(1).reverse().slice(0,50).map(r => ({date:formatDate(r[1]), desc:r[2], amount:r[3], cat:r[4], pay:r[5]}));
}
function addExpense(o) {
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Gastos").appendRow(['GAST-'+Date.now(), new Date(), o.desc, o.amount, o.cat, o.pay]);
  logAction("ADD_EXP", o.amount, o.user);
}
function getAssetsData() {
  var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Activos");
  if(!sh) return [];
  var d = sh.getDataRange().getValues();
  return d.slice(1).map(r => ({id:r[0], name:r[1], desc:r[2], val:r[4], loc:r[5], state:r[6]}));
}
function addAsset(o) {
  var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Activos");
  if(!sh) sh = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("Activos");
  sh.appendRow(['ACT-'+Date.now(), o.name, o.desc, new Date(), o.val, o.loc, o.state]);
  logAction("ADD_ASSET", o.name, o.user);
}
function deleteAsset(id, user) {
  var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Activos");
  var d = sh.getDataRange().getValues();
  for(var i=1; i<d.length; i++) { if(d[i][0]==id) { sh.deleteRow(i+1); break; } }
  logAction("DEL_ASSET", id, user);
}
function getSalesHistory() {
  var d = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Ventas").getDataRange().getValues();
  return d.slice(1).reverse().slice(0,50).map(r => ({id:r[0], date:formatDate(r[1]), prod:r[2], cantidad:r[3], total:r[5], pay:r[7], user:r[10]}));
}
function getInventoryItem(id) { return getInventoryData().find(x => x.id === id); }

function formatMoney(n) { return "$"+Math.floor(n||0).toLocaleString('es-CO'); }
function formatDate(d) { return new Date(d).toLocaleDateString('es-CO'); }