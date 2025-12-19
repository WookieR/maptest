import { format, isBefore, isSameDay, startOfDay } from "date-fns";

export function syncQuotas(payment: any, quotas: any) {
  const todayDate =  startOfDay(new Date());
  var amount = payment.amount;
  const unPaidQuotas = quotas.filter((quota: any) => !quota.payment_completed);

  const quotasToPay = unPaidQuotas.map((unPaidQuota: any) => {
    return {
      ...unPaidQuota,
      past: payment.config == 'Acumulacion' ? (isBefore(new Date(unPaidQuota.created_at), todayDate) || isSameDay(new Date(unPaidQuota.created_at), todayDate)) : true
    }
  });

  quotasToPay.forEach((quotaToPay: any) => {
    if(amount == 0 || !quotaToPay.past){
      return;
    }

    const quotaRemaining = parseFloat(quotaToPay.amount) - quotaToPay.quota_payments.reduce((accu: any, current: any) => accu += parseFloat(current.amount), 0.0);

    const {amount: amountNewValue, amountToAdd: amountToPay} = decrease(amount, quotaRemaining);
    amount = amountNewValue;

    // quotaToPay.payment_completed = amountToPay >= quotaRemaining ? true : false,
    quotaToPay.updatedInVisit = true;
    quotaToPay.quota_payments.push({
      amount: amountToPay,
      type: payment.type,
    });

    quotas.find((quota: any) => quota.id == quotaToPay.id).payment_completed = amountToPay >= quotaRemaining ? true : false;
  })

  quotasToPay.reverse();

  quotasToPay.forEach((quotaToPay: any) => {
    if(amount == 0 || quotaToPay.past){
      return;
    }

    const quotaRemaining = parseFloat(quotaToPay.amount) - quotaToPay.quota_payments.reduce((accu: any, current: any) => accu += parseFloat(current.amount), 0.0);

    const {amount: amountNewValue, amountToAdd: amountToPay} = decrease(amount, quotaRemaining);
    amount = amountNewValue;

    quotaToPay.updatedInVisit = true;
    quotaToPay.quota_payments.push({
      amount: amountToPay,
      type: payment.type,
    });

    quotas.find((quota: any) => quota.id == quotaToPay.id).payment_completed = amountToPay >= quotaRemaining ? true : false;
  });

  quotasToPay.reverse();

  return quotasToPay;
}

function decrease(amount: any, quotaRemaining: any){
  if(amount < quotaRemaining){
    const amountToAdd = amount;
    amount = 0;
    return {
      amount,
      amountToAdd
    }
  }

  if(amount >= quotaRemaining){
    const amountToAdd = quotaRemaining;
    amount = amount - quotaRemaining;
    return {
      amount,
      amountToAdd
    }
  }

  return amount;
}