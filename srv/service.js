const cds = require('@sap/cds');
const { extname } = require("path");
const LOG = cds.log('service');
const {
    getAribaPOs,
    readAribaPOs,
    readS4POs,
    readS4POItems,
    readPurchaseContracts,
    readContractItemDetail,
    createServiceEntry,
    readAttachments,
    saveAttachments
} = require('./lib/handlers')


module.exports = class SESMassAppService extends cds.ApplicationService { 
  async init() {
    let attachments;
    Object.values(this.entities).forEach((entity) => {
      for (let elementName in entity.elements) {
        if (elementName === "SiblingEntity") continue;
        const element = entity.elements[elementName], target = element._target;
        if (target?.["@_is_media_data"]) {
          attachments = target;
        }
      }
    });
    /*** HANDLERS REGISTRATION ***/
    //this.before('READ', 'SESPurchaseOrders', insertAribaPOs);
    this.on('READ', 'SESPurchaseOrders', async (req) => {
      LOG.info("START - In method SES App Service SESPurchaseOrders");
      const purchaseOrder = await getAribaPOs(req);
      LOG.info("END - In method SES App Service SESPurchaseOrders "+ purchaseOrder.length);
      return purchaseOrder;
    });
    //this.on('READ', 'SESPurchaseOrders', getAribaPOs);
    // ON events
    this.on('READ', ['AribaPurchaseOrders'], readAribaPOs);
    this.on('READ', ['S4PurchaseOrder','S4PurchaseOrderItem'], readS4POs);
    this.on('READ', 'LineItems', readS4POItems);
    this.on('READ', 'ContractItems', readPurchaseContracts);

    //validation before save
    this.after('SAVE', 'SESMainHeader', async (data, req) => {
      await createServiceEntry(data, req, attachments);
    });

    this.after('CANCEL', 'EntrySheetItems', async (req, res)=> {  
        const abc = req;
    });
    this.before(['CREATE'], ['SESMain.drafts'], readContractItemDetail);
  /*  this.before('NEW', "SESAppService_SESPurchaseOrders_attachments_drafts", async req => {
        req.data.url = cds.utils.uuid();
        req.data.ID = cds.utils.uuid();
        let ext = extname(req.data.filename).toLowerCase().slice(1);
        req.data.mimeType = Ext2MimeTyes[ext] || "application/octet-stream";
      }); */

   // this.after("READ", ["Attachments", "Attachments.drafts"], readAttachments);
   // this.after("SAVE", "Attachments", saveAttachments);

   
    return super.init()
  }}
  