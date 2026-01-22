import { useMemo } from "react";
import * as Yup from "yup";
// import { validateAddress, validateBusinessName, validateFirastName, validateLastName } from './onBoardingSchema'; // Assuming these are exported
import { validateFirastName, validatePhoneNumber, validatePostalCode,validateAddress, validateBusinessName, validateLastName, } from "../../../commonScreens/commonValidations";

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;

export const EditPersonalInfoSchema = (isAddressRequired: boolean, accountType?: "Personal" | "Business" | "Corporate") => Yup.object().shape({
    firstName: accountType !== 'Business'
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-first-name", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !value || validateFirastName(value))
        : Yup.string().nullable(),
    lastName: accountType !== 'Business'
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-last-name", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !value || validateLastName(value))
        : Yup.string().nullable(),
    gender: accountType !== 'Business'
        ? Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        : Yup.string().nullable(),
    businessName: accountType === 'Business'
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-business-name", "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME", value => !value || validateBusinessName(value))
        : Yup.string().nullable(),
    incorporationDate: accountType === 'Business'
        ? Yup.date().nullable().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        : Yup.date().nullable(),
    phoneNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("validate-phone-number", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || validatePhoneNumber(value)),
    phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    state: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .matches(/^[a-zA-Z0-9\s-]+$/, "INVALID_STATE_ERROR")
            .test('no-emojis', "INVALID_STATE_ERROR", value => !value || !EMOJI_REGEX.test(value))
            .test('no-html', "INVALID_STATE_ERROR", value => !value || !HTML_REGEX.test(value))
            .max(50, "STATE_MAX_LENGTH_ERROR")
        : Yup.string().nullable(),
    city: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-city", "INVALID_CITY_ERROR", value => !value || validateAddress(value)) // Assuming validateAddress can be used for city
        : Yup.string().nullable(),
    addressLine1: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-addressLine1", "INVALID_ADDRESS_LINE_1_ERROR", value => !value || validateAddress(value))
        : Yup.string().nullable(),
    postalCode: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-postal-code", "INVALID_POSTAL_CODE_ERROR", value => !value || validatePostalCode(value))
        : Yup.string().nullable(),
});

// Add these to your i18n translations:
// "INVALID_STATE_ERROR": "Invalid state format."
// "STATE_MAX_LENGTH_ERROR": "State cannot exceed 50 characters."
// "INVALID_CITY_ERROR": "Invalid city format."
// "INVALID_ADDRESS_LINE_1_ERROR": "Invalid address format."
// "INVALID_POSTAL_CODE_ERROR": "Invalid postal code."


/**
 * Note on Yup validation schema generation:
 * The schema is generated dynamically based on `isAddressRequired` and `accountType`.
 * This means you'll need to call `EditPersonalInfoSchema(isAddressRequired, accountType)`
 * inside your component where these values are known, typically memoizing the result
 * to prevent re-creation on every render unless dependencies change.
 *
 * Example usage in component:
 *
 * const userinfo = useSelector((state: RootState) => state.userReducer?.userDetails);
 * const [isAddressRequired, setIsAddressRequired] = useState<boolean>(false);
 * // ... fetch isAddressRequired status ...
 *
 * const validationSchema = useMemo(() => {
 *   return EditPersonalInfoSchema(isAddressRequired, userinfo?.accountType);
 * }, [isAddressRequired, userinfo?.accountType]);
 *
 * <Formik
 *   initialValues={initialValues}
 *   validationSchema={validationSchema}
 *   onSubmit={handleSubmit}
 * >
 *  ...
 * </Formik>
 *
 * Make sure that `validateFirastName`, `validateLastName`, `validateBusinessName`,
 * `validatePhoneNumber`, `validatePostalCode`, and `validateAddress` are correctly
 * exported from their respective files and handle `null` or `undefined` values gracefully
 * if Yup passes them (e.g., `!value || actualValidationLogic(value)`).
 */

/**
 * Placeholder for i18n keys if not already present:
 *
 * "GLOBAL_CONSTANTS.IS_REQUIRED": "This field is required.",
 * "GLOBAL_CONSTANTS.INVALID_FIRST_NAME": "Invalid first name.",
 * "GLOBAL_CONSTANTS.INVALID_LAST_NAME": "Invalid last name.",
 * "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME": "Invalid business name.",
 * "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER": "Invalid phone number.",
 * "INVALID_STATE_ERROR": "State contains invalid characters or format.",
 * "STATE_MAX_LENGTH_ERROR": "State must be at most 50 characters.",
 * "INVALID_CITY_ERROR": "City contains invalid characters or format.",
 * "INVALID_ADDRESS_LINE_1_ERROR": "Address Line 1 contains invalid characters or format.",
 * "INVALID_POSTAL_CODE_ERROR": "Invalid postal code format."
 *
 * For `validateFirastName`, `validateLastName`, `validateBusinessName`, `validateAddress`, `validatePostalCode`:
 * Ensure these functions return `true` for valid input and `false` for invalid input.
 *
 * Example for `validateFirastName` (if not already implemented as such):
 * export const validateFirastName = (name: string): boolean => {
 *   if (!name) return false; // Or true if empty is allowed by Yup.string().nullable()
 *   const trimmedName = name.trim();
 *   // Regex from onBoardingSchema.tsx
 *   const namePattern = /^(?=.*[A-Za-z])[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$/;
 *   const HTML_REGEX = /<[^>]*>?/g;
 *   const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
 *   if (EMOJI_REGEX.test(trimmedName)) return false;
 *   if (HTML_REGEX.test(trimmedName)) return false;
 *   if (!/[a-zA-Z]/.test(trimmedName)) return false; // Ensure not only numbers
 *   return namePattern.test(trimmedName) && trimmedName.length > 0 && trimmedName.length <= 50;
 * };
 * Similar adjustments might be needed for other imported validation functions
 * to align with Yup's `.test()` method expectations.
 */