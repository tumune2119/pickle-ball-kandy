// Browser-only helper shared by every flow that sends a customer to
// PayHere's hosted checkout (new booking, retry payment) - PayHere expects
// a full-page form POST, not a fetch redirect.
export function redirectToPayHereCheckout(checkoutUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
