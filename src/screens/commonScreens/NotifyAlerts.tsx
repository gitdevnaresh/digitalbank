import React, { useState, useEffect, useCallback } from 'react';
import {  useWindowDimensions, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useThemeColors } from '../../hooks/useThemeColors';
import ButtonComponent from '../../newComponents/buttons/button';
import { s } from '../../newComponents/theme/scale';
import ViewComponent from '../../newComponents/view/view';
import NoticesService from '../../apiServices/noticesService';
import CustomOverlay from '../../newComponents/models/commonOverlay';
import NoDataComponent from '../../newComponents/noData/noData';
import { useSelector, useDispatch } from 'react-redux';
import ScrollViewComponent from '../../newComponents/scrollView/scrollView';
import { AltertNotificationImage } from '../../assets/svg';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import { setShouldShowNotices, setNotificationShown } from '../../redux/actions/actions';

interface Notice {
    id: string | null;
    tittle: string | null;
    content: string | null;
}



const NotifyAlerts = React.memo(() => {
    const { width } = useWindowDimensions();
    const safeWidth = width || Dimensions.get('window').width;
    const [noticesList, setNoticesList] = useState<Notice[]>([]);
    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isVisible, setIsVisible] = useState(false);
    const [overlayKey, setOverlayKey] = useState(0);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const appUpdateVisible = useSelector((state: any) => state.userReducer?.appUpdateVisible);
    const dispatch = useDispatch();
          const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);

    const shouldShowNotices = useSelector((state: any) => state.userReducer?.shouldShowNotices);
    const [completedNoticeIds, setCompletedNoticeIds] = useState<string[]>([]);
    
    const isLoggedIn = useSelector((state: any) => state.userReducer?.login);
    
    useEffect(() => {
        if (shouldShowNotices && isLoggedIn && userInfo?.id && !appUpdateVisible) {
            getNotices();
        }
    }, [shouldShowNotices, isLoggedIn, userInfo?.id, appUpdateVisible]);
    
    useEffect(() => {
        if (noticesList.length > 0) {
            setCurrentNotice(noticesList[currentNoticeIndex]);
        } else {
            setCurrentNotice(null);
        }
    }, [noticesList, currentNoticeIndex]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const getNotices = async () => {
        try {
            const response: any = await NoticesService.getNotices();
            if (response?.ok && Array.isArray(response.data) && response.data.length > 0) {
                const uncompletedNotices = response.data.filter((notice: any) => !completedNoticeIds.includes(notice.id));
                
                if (uncompletedNotices.length > 0) {
                    setNoticesList(uncompletedNotices);
                    setCurrentNoticeIndex(0);
                    setOverlayKey(prev => prev + 1);
                    setIsVisible(true);
                    dispatch(setNotificationShown(true));
                    dispatch(setShouldShowNotices(false));
                } else {
                    dispatch(setShouldShowNotices(false));
                }
            } else {
                dispatch(setShouldShowNotices(false));
            }
        } catch (error) {
            dispatch(setShouldShowNotices(false));
        }
    };

  

    const handleNextNotice = useCallback(() => {
        // Mark current notice as completed using direct array access
        const notice = noticesList[currentNoticeIndex];
        if (notice?.id) {
            setCompletedNoticeIds(prev => [...prev, notice.id!]);
        }
        
        if (currentNoticeIndex < noticesList.length - 1) {
            setCurrentNoticeIndex(currentNoticeIndex + 1);
        } else {
            handleClose();
        }
    }, [noticesList, currentNoticeIndex]);

    return (
        <CustomOverlay
            key={overlayKey}
            isVisible={isVisible && !appUpdateVisible}
            showHeader={false}
            crossIcon={false}
            overlayStyle={{
                width: safeWidth - 50,
                maxHeight: Dimensions.get('window').height - 100
            }}
        >
                {currentNotice && (
                    <ViewComponent style={[]}>
                        <ScrollViewComponent>
                                <>
                        <ViewComponent style={[commonStyles.mxAuto]}>
                            <AltertNotificationImage width={s(150)} height={s(120)} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.titleSectionGap]}>
                            {currentNotice?.content ? (
                                <RenderHtml
                                    contentWidth={safeWidth - 60}
                                    source={{ html: currentNotice.content }}
                                    tagsStyles={{
                                        body: {
                                            textAlign: 'center',
                                            color: NEW_COLOR.TEXT_WHITE,
                                        },
                                        p: {
                                            textAlign: 'center',
                                            color: NEW_COLOR.TEXT_WHITE,
                                                        fontSize: s(16)
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <NoDataComponent />
                                        )}
                                    </ViewComponent>
                                </>
                        </ScrollViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]}/>          
                 <ViewComponent >
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.OKEY"
                                onPress={handleNextNotice}
                            />
                        </ViewComponent>
                    </ViewComponent>
                )}
            </CustomOverlay>
    );
});

export default NotifyAlerts;