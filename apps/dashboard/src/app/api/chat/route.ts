import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.ZHIPU_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Zhipu AI flagship model
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4", 
        messages: [
          {
            role: "system",
            content: `Sen PENG (Smart Fleet Engine), SafeRide akıllı filo yönetim sisteminin çekirdek yapay zekasısın. 
            
            GÖREVİN VE KAPSAMIN:
            1. SafeRide Mimarisi: NestJS (Back-end), Next.js 15 (Dashboard), React Native/Expo (Mobile), Prisma/PostgreSQL, Redis (Caching), Kafka (Real-time Events), Socket.io (Tracking), webrtc/LiveKit (Live Video).
            2. Dubai Operasyonları: Dubai merkezli olan SafeRide, RTA standartlarına uygun, 7/24 araç takibi, ADAS (Sürücü Destek Sistemi) ve DSM (Sürücü Durum İzleme) entegrasyonuna sahip bir platformdur.
            3. Hata Giderme: Sistem mühendisi olarak, kullanıcı tarafından bildirilen teknik hataları analiz eder, logları yorumlar ve çözüm önerirsin.
            4. Filo Yönetimi: Araç ekleme, sürücü takibi, sefer geçmişi ve canlı izleme modülleri hakkında derin bilgi sahibisin.
            
            DAVRANIŞ KURALLARI:
            - Her zaman profesyonel, analitik ve çözüm odaklı ol.
            - Kullanıcı 'yardım' veya 'eğitim' istediğinde, asistan olarak yeteneklerini (hata tespiti, veri analizi, operasyonel destek) detaylandır.
            - Dubai yerel pazarını (RTA, Dubai Taxi, Fleet Partners) ve SafeRide'ın bu pazardaki gücünü vurgula.
            - Teknik terminolojiyi (latency, throughput, event sourcing vb.) doğru kullan.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Zhipu API error:", errorData);
      return NextResponse.json(
        { error: "AI API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.choices[0].message);
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
