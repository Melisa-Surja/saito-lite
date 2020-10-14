const ProductManagerTemplate = require('./product-manager.template');
const UpdateProduct = require('./product-update');
const ScanIn = require('./scan-in');
const ScanCheck = require('./scan-check');
const ScanSummary = require('./scan-summary');
//const AttachFile = require('./attach-file');




module.exports = ProductManager = {

  render(app, data) {

    document.querySelector(".main").innerHTML = ProductManagerTemplate();

    //
    // load products
    //
    var sql = `
      select 
        *
      from 
        products
      where
        products.deleted <> 1
      `;

    var html = `
          <div class="table-head">Name</div>
          <div class="table-head">Details</div>
          <div class="table-head">Product Image</div>
          <div class="table-head grid-buttons"></div>
        `;
    var rownum = 0;
    var rowclass = "";

    data.mod.sendPeerDatabaseRequestRaw("camel", sql, function (res) {
      res.rows.forEach(row => {
        rownum++;
        if (rownum % 2) { rowclass = "even" } else { rowclass = "odd" };
        html += `<div class="${rowclass}">${row.product_name}</div>`;
        html += `<div class="${rowclass}">${row.product_details}</div>`;
        html += `<div class="${rowclass}"><img style='max-width:100px;max-height:100px' src='${row.product_photo}'/></div>`;
        html += `
        <div class="grid-buttons ${row.uuid} rowclass">
          <div class="grid-action scan" data-uuid="${row.uuid}">Scan In</div>
          <div class="grid-action summary" data-uuid="${row.uuid}">Summary</div>
          <div class="grid-action edit" data-uuid="${row.uuid}">Edit</div>
          <div class="grid-action delete" data-uuid="${row.uuid}">Delete</div>          
        </div>`;
      });
      document.querySelector(".loading").style.display = "none";
      document.querySelector("#product-table").style.display = "grid";
      document.querySelector("#product-table").innerHTML = html;


      //treat buttons
      document.querySelectorAll('.grid-action.scan').forEach(el => {
        el.addEventListener('click', (e) => {
          data.product_uuid = e.target.dataset.uuid;
          //salert(`Trigger Scan Action Here <br> ${data.product_uuid}`);
          ScanIn.render(app, data);
          ScanIn.attachEvents(app,data);
        });
      });

      document.querySelectorAll('.grid-action.summary').forEach(el => {
        el.addEventListener('click', (e) => {
          data.product_uuid = e.target.dataset.uuid;
          ScanSummary.render(app, data);
          ScanSummary.attachEvents(app,data);
        });
      });

      document.querySelectorAll('.grid-action.edit').forEach(el => {
        el.addEventListener('click', (e) => {
          data.product_uuid = e.target.dataset.uuid;
          UpdateProduct.render(app, data);
          UpdateProduct.attachEvents(app, data);
        });
      });

      document.querySelectorAll('.grid-action.delete').forEach(el => {
        el.addEventListener('click', (e) => {

          data.product_uuid = e.target.dataset.uuid;
          data.mod.sendPeerDatabaseRequest("camel", "products", "uuid", "product.uuid = '" + data.product_uuid + "'", null, async (res) => {

            let c = confirm("Are you sure you want to delete this product?");
            if (c) {

              let values = [];
              values[0] = {};
              values[0].dbname = "camel";
              values[0].table = "products";
              values[0].column = "uuid";
              values[0].value = res.rows[0].uuid;

              data.mod.deleteDatabase(values);

              await salert("Delete Requested - please reload in 30 seconds");

            }
          });
        });
      });

    });

  },

  attachEvents(app, data) {

    document.querySelector('.new-product-btn').addEventListener('click', (e) => {
      UpdateProduct.render(app, data);
      UpdateProduct.attachEvents(app, data);
    });

    document.querySelector('.check-btn').addEventListener('click', (e) => {
      ScanCheck.render(app, data);
      ScanCheck.attachEvents(app,data);
    });

  }
}
