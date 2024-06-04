

 function soapSamplePayload_Sync() {
    const soapRequestArgs = {
        IO_INPUT: {
            SERVICE_ENTRY_SHEET_REQUEST_MS: {
                MESSAGE_HEADER: {
                    CREATION_DATE_TIME: '2024-03-01T00:00:00.000Z',
                    SENDER_BUSINESS_SYSTEM_ID: 'AN01053225455-T',
                    RECIPIENT_BUSINESS_SYSTEM_ID: 'L5SCLNT100', //coming po systemID
                    REFERENCE_ID: {
                        CONTENT: generateReferenceId()
                    }
                },
                SERVICE_ENTRY_SHEET_ENTITY: {
                    ACTION_CODE: '01', 
                    APPROVAL_STATUS: '10',
                    SERVICE_ENTRY_SHEET: "",
                    SERVICE_ENTRY_SHEET_NAME: 'TestNKSOAP_0301',
                    PURCHASE_ORDER: '4500020970',
                    RESPONSIBLE_PERSON: '',
                    POSTING_DATE: '2024-03-01T00:00:00.000Z',
                    SERVICE_ENTRY_SHEET_ITEM_LIST: {
                        SERVICE_ENTRY_SHEET_ITEM_ENTIT: {
                            item: [{
                                ACTION_CODE: '01',
                                ACCOUNT_ASSIGNMENT_CATEGORY: '',
                                CONFIRMED_QUANTITY: {
                                    UNIT_CODE: 'HUR',
                                    CONTENT: '1'
                                },
                                NET_PRICE_AMOUNT: {
                                    CURRENCY_CODE: 'USD',
                                    CONTENT: '10'
                                },
                                PURCHASE_ORDER_ITEM: '00020',
                                QUANITITY_UNIT: 'HUR',
                                SERVICE: "",
                                SERVICE_ENTRY_SHEET_ITEM: "",
                                SERVICE_ENTRY_SHEET_ITEM_REFER: {
                                    CONTENT: '0204'
                                },
                                SERVICE_ENTRY_SHEET_ITEM_DESC: 'Test Item',
                                SERVICE_PERFORMANCE_DATE: '2023-11-06T00:00:00.000Z',
                                SERVICE_PERFORMANCE_END_DATE: '2023-11-06T00:00:00.000Z',
                                SERVICE_PERFORMER: 'EMPLOYEE',
                                PURCHASE_CONTRACT_ITEM: '00010',
                                SRVC_ENTR_SHT_ITEM_IS_FINAL: ''
                            },
                            {
                                ACTION_CODE: '01',
                                ACCOUNT_ASSIGNMENT_CATEGORY: '',
                                CONFIRMED_QUANTITY: {
                                    UNIT_CODE: 'HUR',
                                    CONTENT: '1'
                                },
                                NET_PRICE_AMOUNT: {
                                    CURRENCY_CODE: 'USD',
                                    CONTENT: '10'
                                },
                                PURCHASE_ORDER_ITEM: '00020',
                                QUANITITY_UNIT: 'HUR',
                                SERVICE: "",
                                SERVICE_ENTRY_SHEET_ITEM: "",
                                SERVICE_ENTRY_SHEET_ITEM_REFER: {
                                    CONTENT: '0204'
                                },
                                SERVICE_ENTRY_SHEET_ITEM_DESC: 'Test Item',
                                SERVICE_PERFORMANCE_DATE: '2023-11-06T00:00:00.000Z',
                                SERVICE_PERFORMANCE_END_DATE: '2023-11-06T00:00:00.000Z',
                                SERVICE_PERFORMER: 'EMPLOYEE',
                                PURCHASE_CONTRACT_ITEM: '00010',
                                SRVC_ENTR_SHT_ITEM_IS_FINAL: ''
                            }]
                        }
                    },
                    TEXT_COLLECTION: {
                        TEXT: {
                            item: {
                                ACTION_CODE: '01',
                                NOTE_TYPE_CODE: 'SES_HEADER_NOTE',
                                CONTENT_TEXT: {
                                    LANGUAGE_CODE: 'EN',
                                    CONTENT: 'Header Note'
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    return soapRequestArgs;
}
async function prepareSoapPayload(data, attachmentsContent) {
    const massPOs = await getMassPOs(data, attachmentsContent);
    const soapRequestArgs = {
        IT_INPUT: {
            item: massPOs
        }
    };
    return soapRequestArgs;
}
function getPOs(data) {
   
}
function getNotes(data) {
    let notes_data = [];
        notes_data.push({
        ACTION_CODE: '01',
        NOTE_TYPE_CODE: 'SES_HEADER_NOTE',
        CONTENT_TEXT: {
            LANGUAGE_CODE: 'EN',
            CONTENT: data.plainLongText
        }
    });
    /*
    const notes = data.notes;
    for (let i = 0; i < notes.length; i++) {
        notes_data.push({
            ACTION_CODE: '01',
            NOTE_TYPE_CODE: 'SES_HEADER_NOTE',
            CONTENT_TEXT: {
                LANGUAGE_CODE: 'EN',
                CONTENT: notes[i].plainLongText
            }
        });
    } */
    return notes_data;
}

async function getMassPOs(data, attachments) {
const purchaseOrders = [];
const pos = data.main;
for (let i = 0; i < pos.length; i++) {
    let filename, mimetype , attachcontent;
    const contents = pos[i].attachments;
    if(contents.length > 0) {
        const key = { ID: contents[0].ID }
        const attachContents = await SELECT.from(attachments.drafts, key).columns("content");
        attachcontent = await _streamToString(attachContents.content);
        filename = contents[i].filename;
        mimetype = contents[i].mimeType;
    }
    purchaseOrders.push({
      SENDER_BUSINESS_SYSTEM_ID: 'AN01053225455-T',
      RECIPIENT_BUSINESS_SYSTEM_ID: 'L5SCLNT100',
      APPROVAL_STATUS: 10,
      SERVICE_ENTRY_SHEET_NAME: 'TESTSES',
      PURCHASE_ORDER: pos[i].purchaseOrder_documentNumber,
      POSTING_DATE: pos[i].postingDate+'T00:00:00.000Z',
      PURCHASE_ORDER_ITEM: pos[i].purchaseOrderItem_PurchaseOrderItem,
      SERVICE_ENTRY_SHEET_ITEM_DESC: 'TEST SES DESC',
      SERVICE_PERFORMANCE_DATE: pos[i].periodStart+'T00:00:00.000Z',
      SERVICE_PERFORMANCE_END_DATE: pos[i].periodEnd+'T00:00:00.000Z',
      PURCHASE_CONTRACT_ITEM: pos[i].contractItem_PurchaseContractItem,
      CONFIRMED_QUANTITY: {
        UNIT_CODE: 'HUR',//sesItem[i].orderPriceUnit, //AJ TO FIND THE ODATA SERVICE
        CONTENT:  pos[i].qty
      },
      NET_PRICE_AMOUNT: {
        CURRENCY_CODE:  pos[i].documentCurrency,
        CONTENT:  pos[i].netPrice
      },
      SERVICE_PERFORMER: 'EMPLOYEE',
      TEXT: {
        NOTE_TYPE_CODE: 'SES_HEADER_NOTE',
        LANGUAGE_CODE: 'EN',
        CONTENT: pos[i].plainLongText
      },
      ATTACHMENT: {
        FILE_NAME: filename ? filename: 'TEST.PDF',
        MIME_TYPE: mimetype ? mimetype : 'PDF',
        CONTENT: attachcontent ? attachcontent : 'DQplbmRvYmoNCg0KMzAgMCBvYmoNCls0IDAgUiA0IDAgUiA1IDAgUiA1IDAgUgo2IDAgUiA3IDAgUiA4IDAgUiA5IDAgUgoxMCAwIFIgMTAgMCBSIDEwIDAgUiAxMSAwIFIKMTIgMCBSIDEzIDAgUiAxNCAwIFIgMTQgMCBSCjE0IDAgUiAxNSAwIFIgMTYgMCBSIDE2IDAgUgoxNiAwIFIgMTcgMCBSIDE4IDAgUiAxOCAwIFIKMTkgMCBSIDIwIDAgUiAyMSAwIFIgMjEgMCBSCjIxIDAgUiAyMSAwIFIgMjEgMCBSIDIyIDAgUgoyMiAwIFIgMjIgMCBSIDIzIDAgUiAyNCAwIFIKMjUgMCBSIDI1IDAgUiAyNiAwIFIgMjcgMCBSCjI4IDAgUl0NCmVuZG9iag0KDQozMSAwIG9iag0KPDwKL1Byb2R1Y2VyIChVbml0ZWQgQWlybGluZXMgdmlhIEFCQ3BkZikKPj4NCmVuZG9iag0KDQp4cmVmDQowIDMyDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAxNjY5MjMgMDAwMDAgbg0KMDAwMDE2Njk2NSAwMDAwMCBuDQowMDAwMTY3MDI4IDAwMDAwIG4NCjAwMDAxNjcyOTAgMDAwMDAgbg0KMDAwMDE2NzM2OSAwMDAwMCBuDQowMDAwMTY3NDQ4IDAwMDAwIG4NCjAwMDAxNjc1MjUgMDAwMDAgbg0KMDAwMDE2NzYwMiAwMDAwMCBuDQowMDAwMTY3Njc5IDAwMDAwIG4NCjAwMDAxNjc3NTYgMDAwMDAgbg0KMDAwMDE2NzgzOSAwMDAwMCBuDQowMDAwMTY3OTE4IDAwMDAwIG4NCjAwMDAxNjc5OTcgMDAwMDAgbg0KMDAwMDE2ODA3NiAwMDAwMCBuDQowMDAwMTY4MTYxIDAwMDAwIG4NCjAwMDAxNjgyNDAgMDAwMDAgbg0KMDAwMDE2ODMyNSAwMDAwMCBuDQowMDAwMTY4NDA0IDAwMDAwIG4NCjAwMDAxNjg0ODYgMDAwMDAgbg0KMDAwMDE2ODU2NSAwMDAwMCBuDQowMDAwMTY4NjQ0IDAwMDAwIG4NCjAwMDAxNjg3MzUgMDAwMDAgbg0KMDAwMDE2ODgyMCAwMDAwMCBuDQowMDAwMTY4ODk5IDAwMDAwIG4NCjAwMDAxNjg5NzggMDAwMDAgbg0KMDAwMDE2OTA2MCAwMDAwMCBuDQowMDAwMTY5MTM5IDAwMDAwIG4NCjAwMDAxNjkyMTggMDAwMDAgbg0KMDAwMDE2OTI5NyAwMDAwMCBuDQowMDAwMTY5MzQxIDAwMDAwIG4NCjAwMDAxNjk2NDMgMDAwMDAgbg0KdHJhaWxlcg0KPDwKL1NpemUgMzIKPj4NCnN0YXJ0eHJlZg0KMTg5DQolJUVPRg0K'
        //FILE_SIZE: '000000170409',
        //CONTENT: 'DQplbmRvYmoNCg0KMzAgMCBvYmoNCls0IDAgUiA0IDAgUiA1IDAgUiA1IDAgUgo2IDAgUiA3IDAgUiA4IDAgUiA5IDAgUgoxMCAwIFIgMTAgMCBSIDEwIDAgUiAxMSAwIFIKMTIgMCBSIDEzIDAgUiAxNCAwIFIgMTQgMCBSCjE0IDAgUiAxNSAwIFIgMTYgMCBSIDE2IDAgUgoxNiAwIFIgMTcgMCBSIDE4IDAgUiAxOCAwIFIKMTkgMCBSIDIwIDAgUiAyMSAwIFIgMjEgMCBSCjIxIDAgUiAyMSAwIFIgMjEgMCBSIDIyIDAgUgoyMiAwIFIgMjIgMCBSIDIzIDAgUiAyNCAwIFIKMjUgMCBSIDI1IDAgUiAyNiAwIFIgMjcgMCBSCjI4IDAgUl0NCmVuZG9iag0KDQozMSAwIG9iag0KPDwKL1Byb2R1Y2VyIChVbml0ZWQgQWlybGluZXMgdmlhIEFCQ3BkZikKPj4NCmVuZG9iag0KDQp4cmVmDQowIDMyDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAxNjY5MjMgMDAwMDAgbg0KMDAwMDE2Njk2NSAwMDAwMCBuDQowMDAwMTY3MDI4IDAwMDAwIG4NCjAwMDAxNjcyOTAgMDAwMDAgbg0KMDAwMDE2NzM2OSAwMDAwMCBuDQowMDAwMTY3NDQ4IDAwMDAwIG4NCjAwMDAxNjc1MjUgMDAwMDAgbg0KMDAwMDE2NzYwMiAwMDAwMCBuDQowMDAwMTY3Njc5IDAwMDAwIG4NCjAwMDAxNjc3NTYgMDAwMDAgbg0KMDAwMDE2NzgzOSAwMDAwMCBuDQowMDAwMTY3OTE4IDAwMDAwIG4NCjAwMDAxNjc5OTcgMDAwMDAgbg0KMDAwMDE2ODA3NiAwMDAwMCBuDQowMDAwMTY4MTYxIDAwMDAwIG4NCjAwMDAxNjgyNDAgMDAwMDAgbg0KMDAwMDE2ODMyNSAwMDAwMCBuDQowMDAwMTY4NDA0IDAwMDAwIG4NCjAwMDAxNjg0ODYgMDAwMDAgbg0KMDAwMDE2ODU2NSAwMDAwMCBuDQowMDAwMTY4NjQ0IDAwMDAwIG4NCjAwMDAxNjg3MzUgMDAwMDAgbg0KMDAwMDE2ODgyMCAwMDAwMCBuDQowMDAwMTY4ODk5IDAwMDAwIG4NCjAwMDAxNjg5NzggMDAwMDAgbg0KMDAwMDE2OTA2MCAwMDAwMCBuDQowMDAwMTY5MTM5IDAwMDAwIG4NCjAwMDAxNjkyMTggMDAwMDAgbg0KMDAwMDE2OTI5NyAwMDAwMCBuDQowMDAwMTY5MzQxIDAwMDAwIG4NCjAwMDAxNjk2NDMgMDAwMDAgbg0KdHJhaWxlcg0KPDwKL1NpemUgMzIKPj4NCnN0YXJ0eHJlZg0KMTg5DQolJUVPRg0K'
      }
      
    });
  }
  return purchaseOrders;
}
async function soapHeaders(soapClient) {
    const addressingHeaders = {
        MessageID: generateMessageID(), // Generate a random MessageID
      };
      const reliableHeaders = {
        'wsrm:Sequence': {
          'wsrm:MessageNumber': '1',
          'wsrm:LastMessage': true,
        },
      };
      soapClient.addSoapHeader(addressingHeaders, '', 'wsa', 'http://www.w3.org/2005/08/addressing');
      soapClient.addSoapHeader(reliableHeaders, '', 'wsrm', 'http://www.w3.org/2005/08/addressing');

    return soapClient;
}
function generateMessageID() {
    return 'uuid:' + Math.random().toString(36).substr(2, 10);
  }

  function _streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      stream.on('error', (err) => reject(err))
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')))
    })
  }
  function soapBodySampleXML_Async() {
    var args = { _xml: `<n1:ServiceEntrySheetRequestMsg
    xmlns:n1=\"http://sap.com/xi/SAPGlobal20/Global\">
    <MessageHeader>
        <CreationDateTime>2023-02-26T00:00:00.000Z</CreationDateTime>
        <SenderBusinessSystemID>AN01053225455-T</SenderBusinessSystemID>
        <RecipientBusinessSystemID>L5SCLNT100</RecipientBusinessSystemID>
        <ReferenceID>0d0f8dc5530n4n60b75028491a61f092</ReferenceID>
    </MessageHeader>
    <ServiceEntrySheetEntity>
        <ActionCode>01</ActionCode>
        <ApprovalStatus>20</ApprovalStatus>
        <ServiceEntrySheet></ServiceEntrySheet>
        <ServiceEntrySheetName>TestNKSOAP_01</ServiceEntrySheetName>
        <PurchaseOrder>4500020970</PurchaseOrder>
        <ResponsiblePerson></ResponsiblePerson>
        <PostingDate>2024-02-26T00:00:00.000Z</PostingDate>
        <ServiceEntrySheetItemList>
            <ServiceEntrySheetItemEntity>
                <ActionCode>01</ActionCode>
                <AccountAssignmentCategory></AccountAssignmentCategory>
                <ConfirmedQuantity unitCode=\"HUR\">1</ConfirmedQuantity>
                <NetPriceAmount currencyCode=\"USD\">10</NetPriceAmount>
                <PurchaseOrderItem>00020</PurchaseOrderItem>
                <QuanitityUnit>HUR</QuanitityUnit>
                <Service></Service>
                <ServiceEntrySheetItem></ServiceEntrySheetItem>
                <ServiceEntrySheetItemReference>0204</ServiceEntrySheetItemReference>
                <WorkItem></WorkItem>
                <ServiceEntrySheetItemDesc>Test Item</ServiceEntrySheetItemDesc>
                <ServicePerformanceDate>2023-11-06T00:00:00.000Z</ServicePerformanceDate>
                <ServicePerformanceEndDate>2023-11-06T00:00:00.000Z</ServicePerformanceEndDate>
                <ServicePerformer>EMPLOYEE</ServicePerformer>
                <PurchaseContractItem>00010</PurchaseContractItem>
                <SrvcEntrShtItemIsFinalEntry>false</SrvcEntrShtItemIsFinalEntry>
            </ServiceEntrySheetItemEntity>
        </ServiceEntrySheetItemList>
    </ServiceEntrySheetEntity>
</n1:ServiceEntrySheetRequestMsg>`
        };
        return args;
  }
  // Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  async function getAttachments(contents) {
    let attachmentStringList= [];
    //data = data.data;
    //const contents = data.attachments; 
    for (var i = 0; i < contents.length; i++) {
        const key = { ID: contents[i].ID }
        let attachContent = await SELECT.from(attachments.drafts, key).columns("content");
            const stringContent = await _streamToString(attachContent.content);
            attachmentStringList.push({FILE_NAME: contents[i].filename, MIME_TYPE: contents[i].mimeType, CONTENT: stringContent}); 
    }
    return attachmentStringList;
}
  // Generate a random reference ID with a specific length
  function generateReferenceId() {
    // Get current timestamp
    const timestamp = new Date().getTime().toString(16);
  
    // Calculate the length of the random string
    const randomStringLength = 32 - timestamp.length; // Adjust to ensure total length is 32 characters
  
    // Generate random string
    const randomString = generateRandomString(randomStringLength);
  
    // Concatenate timestamp and random string to form the reference ID
    const referenceId = timestamp + randomString;
    
    return referenceId;
  }
  
  
module.exports = {
    soapSamplePayload_Sync,
    soapHeaders,
    prepareSoapPayload
}
