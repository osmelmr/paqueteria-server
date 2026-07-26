import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

@Injectable()
export class AiClientService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en el entorno');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractPackagesFromExcel(excelText: string): Promise<any[]> {
    let lastError: unknown;

    for (const modelName of MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(this.buildPrompt(excelText));
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('La IA no devolvió un JSON válido');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.packages || !Array.isArray(parsed.packages)) {
          throw new Error(
            'La respuesta de la IA no contiene un array de packages',
          );
        }
        console.log(parsed.packages);
        return parsed.packages;
      } catch (err) {
        lastError = err;
        const status = (err as { status?: number }).status;
        if (status !== 429 && status !== 503) throw err;
      }
    }

    throw lastError;
  }

  private buildPrompt(excelText: string): string {
    return `
      Eres un asistente experto en extracción de datos de envíos desde texto de archivos Excel.
      El siguiente texto proviene de un Excel con varias filas, cada una con datos de un envío.
      Para cada fila extrae estos campos:
      - "address": dirección (string)
      - "content": contenido (string)
      - "fullName": nombre completo del destinatario (string)
      - "idCard": carnet de identidad (string)
      - "phone": teléfono (string)
      - "province": nombre de la provincia (string)
      - "municipe": nombre del municipio (string)
      - "departureDate": fecha de salida en formato YYYY-MM-DD (string)
      - "hblCodes": arreglo de códigos HBL (array de strings)
      - "weight": peso en kg (número)

      Texto del Excel:
      ---
      ${excelText}
      ---

      Responde únicamente con un JSON con la propiedad "packages" que contenga un array de objetos.
      Ejemplo:
      {
        "packages": [
          {
            "address": "Calle 123",
            "content": "Electrodomésticos",
            "fullName": "Juan Pérez",
            "idCard": "12345678901",
            "phone": "555555555",
            "province": "La Habana",
            "municipe": "Cotorro",
            "departureDate": "2026-07-24",
            "hblCodes": ["ABC123"],
            "weight": 33.5
          }
        ]
      }
      Si algún campo no se encuentra, usa null.
      Anotaciones q te podrian ayudar a identificar un campo:
      el numero de telefono es de cuba siempre
      consejos para identificar el hbl y diferenciarlo de otro numero:
      en ocaciones esta entre [] corcetes
      en ocaciones comienza por CMseguido de numeros y una letra al final ya sea cm o Cm cM o CM y con o sin letra al final
      por lo general la gran mayoria de elementos del resto de la columna tienen una de estas formas
    `;
  }
}
