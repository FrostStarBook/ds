/** @format */

import { css } from 'styled-components';
import { CombatSummaryProps } from './index';

/**
 * Base styles for the mobileUnit list component
 *
 * @param _ The mobileUnit list properties object
 * @return Base styles for the mobileUnit list component
 */
const baseStyles = (_: Partial<CombatSummaryProps>) => css`
    width: 30rem;

    > .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .icon {
            width: 5rem;
        }

        .title {
            margin: 0 0 0 0.6rem;
        }
    }

    > .content {
        display: flex;
        flex-direction: column;
        width: 100%;

        .countdown {
            text-align: center;
        }

        .tileStats {
            margin-top: 1rem;
        }

        > button {
            margin-bottom: 1rem;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
`;

/**
 * The mobileUnit list component styles
 *
 * @param props The mobileUnit list properties object
 * @return Styles for the mobileUnit list component
 */
export const styles = (props: Partial<CombatSummaryProps>) => css`
    ${baseStyles(props)}
`;
