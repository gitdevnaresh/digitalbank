import { useCallback } from "react";
import SummeryDetails from "./withDrawSummary";
import { useNavigation } from "@react-navigation/native";

const CommonWithDrawSummary = (props:any) => {
  const navigation=useNavigation<any>();
        const handleSendAgain = useCallback(() => {
            navigation?.navigate('AllAccounts')
        }, [props?.navigation, props?.route?.params]);
        const handleBackToWallets = useCallback(() => {
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK" , animation: 'slide_from_left' });
        }, [props?.navigation, props?.route?.params]);
  return (
    <SummeryDetails {...props} handleSendAgain={handleSendAgain} handleBackToBank={handleBackToWallets}/>
  
  )
}
export default CommonWithDrawSummary