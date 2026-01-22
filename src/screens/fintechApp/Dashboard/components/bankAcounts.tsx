import React from "react";
import { CoinImages, statusColor } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../newComponents/view/view";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { s } from "../../../../newComponents/theme/scale";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";


// ✅ Keep UI exactly same as your old inline renderItem
const AccountRow = React.memo(function AccountRow({
  item,
  onPress,
  commonStyles,
  decryptAES,
}: {
  item: any;
  onPress: (val: any) => void;
  commonStyles: any;
  decryptAES: (val: string) => string;
}) {
  const currencyKey = item?.currency?.toLowerCase();
  const iconUri =
    currencyKey === "usd"
      ? CoinImages["bankusd"]
      : CoinImages[currencyKey as keyof typeof CoinImages] || "";

  const bankStatus = item?.bankStatus?.toLowerCase() || "pending";
  const isApproved = bankStatus === "approved";

  return (
    <ViewComponent style={[commonStyles.flex1]}>
      <CommonTouchableOpacity
        onPress={() => onPress(item)}
        style={[commonStyles.cardsbannerbg]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
            <ViewComponent style={{ width: s(32), height: s(32) }}>
              <ImageUri uri={iconUri} />
            </ViewComponent>

            <ViewComponent style={isApproved ? [commonStyles.mt8] : [commonStyles.justifyCenter]}>
              <ParagraphComponent style={[commonStyles.secondarytext]} text={item?.name} />

              {isApproved && item?.accountNumber ? (
                <ParagraphComponent
                  style={[commonStyles.primarytext, commonStyles.mt4]}
                  text={decryptAES(item?.accountNumber)}
                />
              ) : (
                <TextMultiLanguage
                  style={[
                    commonStyles.primarytext,
                    { color: statusColor[bankStatus] || statusColor["pending"] },
                  ]}
                  text={item?.bankStatus || "GLOBAL_CONSTANTS.PENDING"}
                />
              )}
            </ViewComponent>
          </ViewComponent>

          <ViewComponent style={[commonStyles.mt8]}>
            <CurrencyText value={item?.amount} symboles={true} style={[commonStyles.primarytext]} />
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    </ViewComponent>
  );
});

AccountRow.displayName = "AccountRow";

export default AccountRow;