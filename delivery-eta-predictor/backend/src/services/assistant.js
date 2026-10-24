export function answerQuestion(question, orders, selected) {
  const t = question.toLowerCase();

  if (t.includes('risk')) {
    const risky = orders.filter((o) => o.riskPercent >= 50);
    return `${risky.length} orders are above 50% late risk: ${risky
      .map((o) => `#${o.orderRef} in ${o.area} (${o.riskPercent}%)`)
      .join(', ')}.`;
  }

  if (t.includes('rider') || t.includes('overload')) {
    const overloaded = orders.filter((o) => o.riderOpenOrders >= 8);
    if (!overloaded.length) return 'No rider is at or above the limit of 8 open orders right now.';
    return (
      overloaded.map((o) => `${o.riderName} has ${o.riderOpenOrders} open orders (${o.area})`).join('; ') +
      '. The dispatch policy limit is 8 (SOP-4).'
    );
  }

  if (t.includes('why') || t.includes('late')) {
    if (!selected) return 'Select an order first.';
    return (
      `#${selected.orderRef} in ${selected.area}: ${selected.explanation.why} ` +
      `Sources: ${selected.explanation.sources.join('; ')}.`
    );
  }

  return 'I can answer about at-risk orders, overloaded riders and the selected order. The RAG assistant will search your SOPs and past cases for other questions.';
}