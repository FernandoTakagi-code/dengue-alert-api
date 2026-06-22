import axios from "axios";
import { env } from "../config/env.js";
import type { InfoDengueResponse, InfoDengueRecord } from "../types/infodengue.js";

const BASE_URL = "https://api.mosqlimate.org/api/datastore/infodengue/";

interface FetchInfoDengueParams {
  geocode: number; // código IBGE do município
  startDate: string; // formato YYYY-MM-DD
  endDate: string; // formato YYYY-MM-DD
}

export async function fetchInfoDengueData(
  params: FetchInfoDengueParams
): Promise<InfoDengueRecord[]> {
  const { geocode, startDate, endDate } = params;

  try {
    const response = await axios.get<InfoDengueResponse>(BASE_URL, {
      headers: {
        "X-UID-Key": env.mosqlimateApiKey,
      },
      params: {
        disease: "dengue",
        start: startDate,
        end: endDate,
        geocode,
        page: 1,
        per_page: 100,
      },
    });

    return response.data.items;
  } catch (error) {
    
    
    throw new Error(
      `Falha ao buscar dados do InfoDengue para geocode ${geocode}: ${error}`
    );
  }
}