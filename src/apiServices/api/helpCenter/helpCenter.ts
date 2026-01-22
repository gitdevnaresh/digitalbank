import { get } from "../../../utils/ApiService";

        
        const HelpCenterService = {

        getHelpCenterContent: async () => {
          const data = await  get("api/v1/m/HelpCenter");
          return   data;
          },
          }
          export default HelpCenterService;
