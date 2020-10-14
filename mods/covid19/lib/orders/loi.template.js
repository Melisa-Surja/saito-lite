module.exports = LOITemplate = () => {

  let html = '';

  html = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'
    xmlns='http://www.w3.org/TR/REC-html40'>

<head>
    <meta charset='utf-8'>
    <title>Purchase Order</title>
    <style>
        body,
        h3,
        h4 {
            font-family: Verdana, Arial, Sans;
        }
        h3,
        h4 {
            color: 003366;
        }
        td {
            font-size: 14px;
        }

        span {
            color: #555;
        }

        h3 {
            display: block;
            text-align: center;
        }
    </style>
</head>

<body>
    <p>
        </br></br></br>
        [BUYER LOGO]
        </br></br></br>
    </p>
    <p>
    <br />
    <h3>Letter of Intent</h3>
    <br />
    </p>
    <p>
        <span class="buyer-name"></span> <br />
        [BUYER ADDRESS 1] <br />
        [BUYER ADDRESS 2] <br />
        [BUYER ADDRESS 3]
    </p>
    <p>
        <span id="loi-date" class="loi-date"><br /></span>
    </p>
    <p>
    <h4 class="intent-product">T0: [Factory Name]: Intent to purchase: </h4>
    </p>
    <p>
        This letter confirms our company's intent to engage in non-binding discussions with you for the purpose of
        procuring the following products or services:
    </p>
    <p>
    <ul>
        <li>
            <div class="product-category"></div>
        </li>
        <li>
            <div class="product-quantity"></div>
        </li>
        <li>
            <div class="payment-terms"></div>
        </li>
    </ul>
    </p>
    <p>
        Please note that <span class="buyer-name"></span> cannot commit to purchase of specific quantities of products
        or services until <span class="buyer-name"></span> has issued its formal purchase request.
    </p>
    <p>
        Sincerely,
        </br></br></br>
        [SIGNATURE]
        </br></br></br></br>
        [SIGNATORY NAME]</br>
        [SIGNATORY TITLE]
    </p>
</body>

</html>
  `;

  return html;

}

