import { useCallback, useEffect } from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { BackHandler } from "react-native";
import ViewComponent from "../../../../../newComponents/view/view";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import CommonSuccess from "../../../../commonScreens/successPage/commonSucces";
import { useLngTranslation } from "../../../../../hooks/useLngTranslation";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { FORM_DATA_LABEL } from "../constants";

interface ApplySuccessProps {
  amount?: string | number;
  currency?: string;
  onDone: () => void;
  refRBSheet?: React.RefObject<{ close: () => void }>;
  cardName?: string;
  cardType?: string | null;
  isSuccessMessage?: boolean;
  isApplyCardSuccess?: boolean;
}
const ApplySuccess: React.FC<ApplySuccessProps> = (props) => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleDoneAction(); return true; }
    );
    return () => backHandler.remove();
  }, [props.onDone]);

  const handleDoneAction = useCallback(() => {
    if (props.onDone) {
      props.onDone();
    }
  }, [props.onDone]);
  useHardwareBackHandler(() => {
    handleDoneAction()
    return true;
  })
  return (
    <ViewComponent>
      <CommonSuccess
        navigation={navigation}
        successMessage={"GLOBAL_CONSTANTS.CARD_REQUESTED_SUCCESSFULLY"}
        buttonText={"GLOBAL_CONSTANTS.DONE"}
        subtitle={`${props?.isApplyCardSuccess
            ? `${props?.cardName} has been applied successfully`
            : `${t("GLOBAL_CONSTANTS.YOU_HAVE_APPLIED_FOR_A")} ${props?.cardName} ${props?.cardType?.toLowerCase() === FORM_DATA_LABEL.VIRTUAL ? props?.cardType : ""
            }`
          }`} buttonAction={handleDoneAction}
        amount={props?.amount?.toString()}
        prifix={props?.currency}
        amountIsDisplay={false}
        isSuccessMessage={props?.isSuccessMessage}
      />
      <ViewComponent style={[commonStyles.mb40]} />
    </ViewComponent>


  );
};

export default ApplySuccess;
