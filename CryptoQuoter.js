async function getTop10Tokens() {
  const response = await fetch('https://api.coinpaprika.com/v1/coins');
  const tokens = await response.json();

  return tokens
    .filter(token => token.rank >= 1 && token.rank <= 20)
    .map(token => token.symbol);
}

async function getTickerData(tickerList) {
  const response = await fetch('https://api.1inch.exchange/v5.0/56/tokens');
  const tokens = await response.json();
  const tokenList = Object.values(tokens.tokens);

  return tokenList.filter(token => tickerList.includes(token.symbol));
}

function renderForm(tokens) {
  const options = tokens.map(token =>
      `<option value="${token.decimals}-${token.address}">${token.name} (${token.symbol})</option>`);
  console.log(tokens);
  console.log(options.join(''));
  document.querySelector('[name=from-token]').innerHTML = options;
  document.querySelector('[name=to-token]').innerHTML = options;
}

/////////////////////


async function formSubmitted(event) {
    event.preventDefault();
    const fromToken = document.querySelector('[name=from-token]').value;
    const toToken = document.querySelector('[name=to-token]').value;
    const [fromDecimals, fromAddress] = fromToken.split('-');
    const [toDecimals, toAddress] = toToken.split('-');
    const fromUnit = 10 ** fromDecimals;
    const decimalRatio = 10 ** (fromDecimals - toDecimals);
  
    /**
          1 DOGE  10 ** 8     100000000
          1 USDT  10 ** 18    10000000000000000
       */
  
    const url = `https://api.1inch.exchange/v5.0/56/quote?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${fromUnit}`;
  
    try {
      const response = await fetch(url);
      const quote = await response.json();
      const exchange_rate =
        Number(quote.toTokenAmount) / Number(quote.fromTokenAmount) / decimalRatio;
      let exchange_rate1 = exchange_rate.toFixed(6);
      document.querySelector('.js-quote-container').innerHTML = `
            <h3>1 ${quote.fromToken.symbol} = ${exchange_rate1} ${quote.toToken.symbol}</h3>
            <p>Gas fee: ${quote.estimatedGas} Gwei</p>
        `;
      console.log(quote);
    } catch (e) {
      document.querySelector('.js-quote-container').innerHTML = `
        The conversion didn't succeed. <br>
        You cannot swap to the same token.`;
    }
  }
  
  document
    .querySelector('.js-submit-quote')
    .addEventListener('click', formSubmitted);


/////////////////////

getTop10Tokens()
    .then(getTickerData)
    .then(renderForm);
