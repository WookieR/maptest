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
  let color = blue;
  let first = true;

  sales.forEach((sale: any) => {
    if((sale.visit.visit_result == null || sale.visit.visit_result == undefined) && color != blue){
      color = yellow
    }

    if(sale.visit.visit_result != null && color == blue){
      color = yellow
    };

    if(color == yellow && first){
      color = sale.visit.visit_result.color;
    }

    if(color != blue && !first){
      color = yellow
    }

    first = false;
  })

  return color;


}