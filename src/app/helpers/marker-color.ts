const blue = '#0268c1';
const yellow = '#FFA500'
const red = '#e51c23';
const green = '#259b24';

export function determineColor(payments: any, target_amount: any) {
  if(payments == null) return "#0268c1";

  const totalPaid = payments.reduce((accumulator: any, currentValue: any) => {
    return accumulator + parseFloat(currentValue.amount);
  }, 0.0);

  if(totalPaid == 0){
    return red
  }

  if(totalPaid < target_amount){
    return yellow
  }

  if(totalPaid >= target_amount){
    return green
  }

  return blue
}

export function determineMultimarkerColor(sales: any){
  let color = '';
  sales.forEach((sale: any) => {
    const saleColor = sale.visit.visit_result != null ? sale.visit.visit_result.color : blue;

    if (color == ''){
      color = saleColor;
      return;
    }

    if(color != saleColor){
      color = yellow;
      return;
    }

    if(color == saleColor){
      color = saleColor;
      return;
    }
  });

  return color;

}