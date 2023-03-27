/** @format */

import { css } from 'styled-components';
import { BuildingProps } from './index';

/**
 * Base styles for the building component
 *
 * @param _ The building properties object
 * @return Base styles for the building component
 */
const baseStyles = (_: Partial<BuildingProps>) => css`
    h3 {
        margin-bottom: 0;
    }

    > .building-image {
        margin: 2rem auto;
        position: relative;
        left: -1rem;
    }

    .secondary-button {
        color: #ccc;
        text-align: center;
        display: inline-block;
    }
    > .action {
        padding: 0 !important;
        border-bottom: 0 !important;
    }
`;

/**
 * The building component styles
 *
 * @param props The building properties object
 * @return Styles for the building component
 */
export const styles = (props: Partial<BuildingProps>) => css`
    ${baseStyles(props)}
`;
