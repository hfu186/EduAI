// import { toast } from "react-hot-toast"
import { apiConnector } from '../apiConnector';
import { catalogData } from '../apis';


export async function getCatalogPageData(categoryId) {
  try {
    const response = await apiConnector(
      "GET",
      `${catalogData.CATALOGPAGEDATA_API}/${categoryId}`
    );
    return response?.data?.data;
  } catch (error) {
    console.log("CATALOG PAGE DATA ERROR:", error);
    return null;
  }
}

