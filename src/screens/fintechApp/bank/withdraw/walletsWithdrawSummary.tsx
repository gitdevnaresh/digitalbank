import { useCallback } from "react";
import SummeryDetails from "./withDrawSummary";
import { useNavigation } from "@react-navigation/native";
import { init } from "i18next";

const WalletsWithDrawSummary = (props:any) => {
  const navigation=useNavigation<any>();
        const handleSendAgain = useCallback(() => {
            navigation?.navigate('WalletsAllCoinsList',{initialTab: 1});
        }, [props?.navigation, props?.route?.params]);
        const handleBackToWallets = useCallback(() => {
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.WALLETS" , animation: 'slide_from_left' });
        }, [props?.navigation, props?.route?.params]);
  return (
    <SummeryDetails {...props} handleSendAgain={handleSendAgain} handleBackToBank={handleBackToWallets} secondaryButtonText={"GLOBAL_CONSTANTS.BACK_TO_WALLETS"}/>
  
  )
}
export default WalletsWithDrawSummary