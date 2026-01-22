import React from "react";
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ViewComponent from '../../../newComponents/view/view';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { s } from '../../../newComponents/theme/scale';
import { ProfileimageDrawer } from '../../../assets/svg';
import { profileDrawerStyles } from './ProfileDrawer'; // Import styles from main
import { WINDOW_WIDTH } from '../../../constants/theme/variables';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';

interface ProfileDrawerMenuItemsProps {
  navigation: any;
}

const ProfileDrawerMenuItems: React.FC<ProfileDrawerMenuItemsProps> = ({ navigation }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const DRAWER_VISIBLE_WIDTH = WINDOW_WIDTH * 0.8;
  const styles = profileDrawerStyles(NEW_COLOR, DRAWER_VISIBLE_WIDTH); // Use imported styles

  const handleMenuItemPress = (screenName: string, params?: any) => {
    navigation.navigate(screenName, params);
  };

  return (
    <ViewComponent style={styles.menuItemsContainer}>
      <ViewComponent>
        <CommonTouchableOpacity onPress={() => handleMenuItemPress('NewProfile')} style={styles.menuItem}>
          <ParagraphComponent text={"GLOBAL_CONSTANTS.PROFILE"} numberOfLines={1} style={styles.menuItemText} />
        </CommonTouchableOpacity>
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
        <CommonTouchableOpacity
          onPress={() => handleMenuItemPress('Notifications')}
          style={[styles.menuItem, commonStyles.dflex, commonStyles.alignCenter]}
        >
          <ParagraphComponent text={"GLOBAL_CONSTANTS.NOTIFICATIONS"} style={styles.menuItemText} />
        </CommonTouchableOpacity>
        {/* Notification Badge (commented out as in original) */}
        {/* <ViewComponent style={[styles.redBg, { width: s(54), height: s(25), borderRadius: s(100) / 2, justifyContent: 'center', alignItems: 'center' }, commonStyles.mt6]}>
          <CommonTouchableOpacity>
            <ParagraphComponent text={'9+'} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textAlwaysWhite, commonStyles.textCenter]} />
          </CommonTouchableOpacity>
        </ViewComponent> */}
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
        <ViewComponent>
          <CommonTouchableOpacity onPress={() => handleMenuItemPress('UpgradeFees')} style={styles.menuItem}>
            <ParagraphComponent text={"GLOBAL_CONSTANTS.MEMBERSHIP"} style={styles.menuItemText} />
          </CommonTouchableOpacity>
        </ViewComponent>
        {/* Membership Badge (commented out as in original) */}
        {/* <ViewComponent style={[commonStyles.membershipbg, { width: s(54), height: s(25), borderRadius: s(100) / 2, justifyContent: 'center', alignItems: 'center', }, commonStyles.mt6]}>
          <CommonTouchableOpacity>
            <ParagraphComponent text={'Gold'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textAlwaysWhite, commonStyles.textCenter]} />
          </CommonTouchableOpacity>
        </ViewComponent> */}
      </ViewComponent>

      <ViewComponent>
        <CommonTouchableOpacity onPress={() => handleMenuItemPress('MembersDashBoard')} style={styles.menuItem}>
          <ParagraphComponent text={"GLOBAL_CONSTANTS.INVITE_FRIENDS"} style={styles.menuItemText} />
        </CommonTouchableOpacity>
      </ViewComponent>

      <ViewComponent>
        <CommonTouchableOpacity onPress={() => handleMenuItemPress('Settings')} style={styles.menuItem}>
          <ParagraphComponent text={"GLOBAL_CONSTANTS.SETTINGS"} style={styles.menuItemText} />
        </CommonTouchableOpacity>
      </ViewComponent>

      <ViewComponent>
        <CommonTouchableOpacity onPress={() => handleMenuItemPress('HelpCenter')} style={styles.menuItem}>
          <ParagraphComponent text={"GLOBAL_CONSTANTS.SUPPORT_CENTER"} style={styles.menuItemText} />
        </CommonTouchableOpacity>
      </ViewComponent>

      <ProfileimageDrawer width={s(200)} height={s(200)} />
    </ViewComponent>
  );
};

export default ProfileDrawerMenuItems;