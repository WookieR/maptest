export function determineColor(payments: any, target_amount: any) {
    if(payments == null) return "#0269c2";

    const totalPaid = payments.reduce((accumulator: any, currentValue: any) => {
      return accumulator + parseFloat(currentValue.amount);
    }, 0.0);

    if(totalPaid == 0){
      return '#e51c23'
    }

    if(totalPaid < target_amount){
      return '#FFA500'
    }

    if(totalPaid >= target_amount){
      return '#259b24'
    }

    return '#0269c2'
}