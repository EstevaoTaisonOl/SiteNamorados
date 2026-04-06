import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { returnUrl, customer } = await request.json();
    const token = process.env.ABACATEPAY_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "Token da AbacatePay não configurado." }, { status: 500 });
    }

    const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX"],
        products: [
          {
            externalId: "eternal-gift-01",
            name: "Presente Digital Eternal Memories",
            quantity: 1,
            price: 1990, // em centavos (R$ 19,90)
          },
        ],
        returnUrl: returnUrl,
        completionUrl: returnUrl + "?paid=true",
        customer: {
          name: customer.name,
          email: customer.email,
          taxId: customer.taxId.replace(/\D/g, ""), // Limpa pontuação do CPF
          cellphone: customer.cellphone.replace(/\D/g, ""), // Limpa pontuação do celular
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("AbacatePay Error:", data);
      return NextResponse.json({ error: data.message || "Erro ao criar cobrança." }, { status: response.status });
    }

    // A AbacatePay retorna a URL de checkout no campo data.url (ou similar dependendo da versão)
    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
