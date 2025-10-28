export function getTotalRemaining (quota: any, exclude: number | null = null){
    const quotaTotal = parseFloat(quota.amount);

    const quotaPayments = [...quota.quota_payments];

    if(exclude) quotaPayments.splice(exclude, 1);

    const totalPaid = quotaPayments.reduce((accumulator: any, currentValue: any) => {
      return accumulator + parseFloat(currentValue.amount);
    }, 0.0);

    let remaining = quotaTotal - totalPaid;
    remaining = Math.round((remaining + Number.EPSILON) * 100) / 100;

    return remaining;
}