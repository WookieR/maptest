import { determineColor } from "./marker-color";

export function buildVisitResult(payments: any, simplePayments: any, targetAmount: any, visitId: any) {
    const paymentsFromVisit = [...payments, ...simplePayments]

    const visitResult = {
        visit_id: visitId,
        status: determineStatus(simplePayments, targetAmount),
        color: determineColor(paymentsFromVisit, targetAmount),
        commentary: null
    }

    return visitResult;
}

function determineStatus(simplePayments: any, target_amount: any){
    const totalPaid = simplePayments.reduce((accu: any, current: any) => {
        return accu += parseFloat(current.amount);
    }, 0.0);

    if(totalPaid == 0){
        return 'Impaga'
    }

    if(totalPaid < target_amount){
        return 'Pago Parcial'
    }

    if(totalPaid >= target_amount){
        return 'Pago Completo'
    }

    return 'Pendiente'
}