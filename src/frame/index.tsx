// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import JbrlCompetition from 'jbrl-competition';
import AppFooter from 'common/components/footer';
import Home from 'pages/home';
import Aggregator from 'pages/aggregator';
import FAQ from 'pages/faq';
import TransactionUpdater from 'state/transactions/transactionUpdater';
import BlockNumberUpdater from 'state/block-number/blockNumberUpdater';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import PositionDetail from 'pages/position-detail';
import styled, { DefaultTheme, ThemeProvider as SCThemeProvider } from 'styled-components';
import { useThemeMode } from 'state/config/hooks';
import TransactionModalProvider from 'common/components/transaction-modal';
import { useAppDispatch } from 'hooks/state';
import { startFetchingTokenLists } from 'state/token-lists/actions';
import { SnackbarProvider } from 'notistack';
import { DEFAULT_NETWORK_FOR_VERSION, NETWORKS, POSITION_VERSION_4, SUPPORTED_NETWORKS } from 'config/constants';
import { setNetwork } from 'state/config/actions';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import Vector1 from 'assets/svg/vector1.svg';
import Vector2 from 'assets/svg/vector2.svg';
import find from 'lodash/find';
import { NetworkStruct } from 'types';
import useProviderService from 'hooks/useProviderService';
import useWeb3Service from 'hooks/useWeb3Service';
import ErrorBoundary from 'common/components/error-boundary/indext';
import useAccount from 'hooks/useAccount';
import FeedbackCard from 'common/components/feedback-card';
import useSdkChains from 'hooks/useSdkChains';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import '@rainbow-me/rainbowkit/styles.css';
import EulerClaimFrame from 'euler-claim/frame';
import NavBar from './navbar';

// FONTS
// import Lato300EOT from 'lato-v32-latin-300.eot';
// import Lato300TTF from 'lato-v32-latin-300.ttf';
// import Lato300WOFF from 'lato-v32-latin-300.woff';
// import Lato300WOFF2 from 'lato-v32-latin-300.woff2';

// import Lato700EOT from 'lato-v32-latin-700.eot';
// import Lato700WOFF from 'lato-v32-latin-700.woff';
// import Lato700TTF from 'lato-v32-latin-700.ttf';
// import Lato700WOFF2 from 'lato-v32-latin-700.woff2';

// import Lato400EOT from 'lato-v32-latin-regular.eot';
// import Lato400TTF from 'lato-v32-latin-regular.ttf';
// import Lato400WOFF from 'lato-v32-latin-regular.woff';
// import Lato400WOFF2 from 'lato-v32-latin-regular.woff2';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

const StyledVector1Container = styled.div`
  position: fixed;
  bottom: -5px;
  left: 0px;
  z-index: -99;
`;
const StyledVector2Container = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  z-index: -99;
`;

interface AppFrameProps {
  isLoading: boolean;
  initializationError: Error | null;
}

const StyledGridContainer = styled(Grid)<{ isSmall?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  ${({ isSmall }) => isSmall && 'margin-bottom: 40px !important;'}
`;

const StyledAppGridContainer = styled(Grid)`
  margin-top: 40px !important;
  flex: 1;
  display: flex;
`;

const StyledContainer = styled(Container)`
  // background-color: #e5e5e5;
  flex: 1;
  display: flex;
`;

const StyledFooterGridContainer = styled(Grid)`
  margin-top: 92px !important;
  position: relative;
  flex: 0;
`;
const AppFrame = ({ isLoading, initializationError }: AppFrameProps) => {
  const providerService = useProviderService();
  const mode = useThemeMode();
  const web3Service = useWeb3Service();
  const account = useAccount();
  const [hasSetNetwork, setHasSetNetwork] = React.useState(false);
  const aggSupportedNetworks = useSdkChains();
  const currentBreakPoint = useCurrentBreakpoint();

  const theme = createTheme({
    palette: {
      mode,
    },
    typography: {
      fontFamily: 'Lato, Roboto, Arial',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-display: swap;
            font-family: 'Lato';
            font-style: normal;
            font-weight: 300;
            src: url('../fonts/lato-v23-latin-300.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-300.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-300.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-300.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-300.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-300.svg#Lato') format('svg'); /* Legacy iOS */
          }
          /* lato-regular - latin */
          @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Lato';
            font-style: normal;
            font-weight: 400;
            src: url('../fonts/lato-v23-latin-regular.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-regular.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-regular.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-regular.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-regular.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-regular.svg#Lato') format('svg'); /* Legacy iOS */
          }
          /* lato-regular - 500 - latin */
          @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Lato';
            font-style: normal;
            font-weight: 500;
            src: url('../fonts/lato-v23-latin-regular.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-regular.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-regular.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-regular.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-regular.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-regular.svg#Lato') format('svg'); /* Legacy iOS */
          }
          /* lato-700 - latin */
          @font-face {
            font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Lato';
            font-style: normal;
            font-weight: 700;
            src: url('../fonts/lato-v23-latin-700.eot'); /* IE9 Compat Modes */
            src: url('../fonts/lato-v23-latin-700.eot?#iefix') format('embedded-opentype'),
              /* IE6-IE8 */ url('../fonts/lato-v23-latin-700.woff2') format('woff2'),
              /* Super Modern Browsers */ url('../fonts/lato-v23-latin-700.woff') format('woff'),
              /* Modern Browsers */ url('../fonts/lato-v23-latin-700.ttf') format('truetype'),
              /* Safari, Android, iOS */ url('../fonts/lato-v23-latin-700.svg#Lato') format('svg'); /* Legacy iOS */
          }

          /* vanilla-extract-css-ns:src/css/reset.css.ts.vanilla.css?source=Lmlla2JjYzAgewogIGJvcmRlcjogMDsKICBib3gtc2l6aW5nOiBib3JkZXItYm94OwogIGZvbnQtc2l6ZTogMTAwJTsKICBsaW5lLWhlaWdodDogbm9ybWFsOwogIG1hcmdpbjogMDsKICBwYWRkaW5nOiAwOwogIHRleHQtYWxpZ246IGxlZnQ7CiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lOwogIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7Cn0KLmlla2JjYzEgewogIGxpc3Qtc3R5bGU6IG5vbmU7Cn0KLmlla2JjYzIgewogIHF1b3Rlczogbm9uZTsKfQouaWVrYmNjMjpiZWZvcmUsIC5pZWtiY2MyOmFmdGVyIHsKICBjb250ZW50OiAnJzsKfQouaWVrYmNjMyB7CiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsKICBib3JkZXItc3BhY2luZzogMDsKfQouaWVrYmNjNCB7CiAgYXBwZWFyYW5jZTogbm9uZTsKfQouaWVrYmNjNSB7CiAgb3V0bGluZTogbm9uZTsKfQouaWVrYmNjNTo6cGxhY2Vob2xkZXIgewogIG9wYWNpdHk6IDE7Cn0KLmlla2JjYzYgewogIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OwogIGNvbG9yOiBpbmhlcml0Owp9Ci5pZWtiY2M3OmRpc2FibGVkIHsKICBvcGFjaXR5OiAxOwp9Ci5pZWtiY2M3OjotbXMtZXhwYW5kIHsKICBkaXNwbGF5OiBub25lOwp9Ci5pZWtiY2M4OjotbXMtY2xlYXIgewogIGRpc3BsYXk6IG5vbmU7Cn0KLmlla2JjYzg6Oi13ZWJraXQtc2VhcmNoLWNhbmNlbC1idXR0b24gewogIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTsKfQouaWVrYmNjOSB7CiAgYmFja2dyb3VuZDogbm9uZTsKICBjdXJzb3I6IHBvaW50ZXI7CiAgdGV4dC1hbGlnbjogbGVmdDsKfQouaWVrYmNjYSB7CiAgY29sb3I6IGluaGVyaXQ7CiAgdGV4dC1kZWNvcmF0aW9uOiBub25lOwp9 */
          [data-rk] .iekbcc0 {
            border: 0;
            box-sizing: border-box;
            font-size: 100%;
            line-height: normal;
            margin: 0;
            padding: 0;
            text-align: left;
            vertical-align: baseline;
            -webkit-tap-highlight-color: transparent;
          }
          [data-rk] .iekbcc1 {
            list-style: none;
          }
          [data-rk] .iekbcc2 {
            quotes: none;
          }
          [data-rk] .iekbcc2:before,
          [data-rk] .iekbcc2:after {
            content: "";
          }
          [data-rk] .iekbcc3 {
            border-collapse: collapse;
            border-spacing: 0;
          }
          [data-rk] .iekbcc4 {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          [data-rk] .iekbcc5 {
            outline: none;
          }
          [data-rk] .iekbcc5::-moz-placeholder {
            opacity: 1;
          }
          [data-rk] .iekbcc5:-ms-input-placeholder {
            opacity: 1;
          }
          [data-rk] .iekbcc5::placeholder {
            opacity: 1;
          }
          [data-rk] .iekbcc6 {
            background-color: transparent;
            color: inherit;
          }
          [data-rk] .iekbcc7:disabled {
            opacity: 1;
          }
          [data-rk] .iekbcc7::-ms-expand {
            display: none;
          }
          [data-rk] .iekbcc8::-ms-clear {
            display: none;
          }
          [data-rk] .iekbcc8::-webkit-search-cancel-button {
            -webkit-appearance: none;
          }
          [data-rk] .iekbcc9 {
            background: none;
            cursor: pointer;
            text-align: left;
          }
          [data-rk] .iekbcca {
            color: inherit;
            text-decoration: none;
          }

          /* vanilla-extract-css-ns:src/css/sprinkles.css.ts.vanilla.css?source=#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 */
          [data-rk] .ju367v0 {
            align-items: flex-start;
          }
          [data-rk] .ju367v2 {
            align-items: flex-end;
          }
          [data-rk] .ju367v4 {
            align-items: center;
          }
          [data-rk] .ju367v6 {
            display: none;
          }
          [data-rk] .ju367v8 {
            display: block;
          }
          [data-rk] .ju367va {
            display: flex;
          }
          [data-rk] .ju367vc {
            display: inline;
          }
          [data-rk] .ju367ve {
            align-self: flex-start;
          }
          [data-rk] .ju367vf {
            align-self: flex-end;
          }
          [data-rk] .ju367vg {
            align-self: center;
          }
          [data-rk] .ju367vh {
            background-size: cover;
          }
          [data-rk] .ju367vi {
            border-radius: 1px;
          }
          [data-rk] .ju367vj {
            border-radius: 6px;
          }
          [data-rk] .ju367vk {
            border-radius: 10px;
          }
          [data-rk] .ju367vl {
            border-radius: 13px;
          }
          [data-rk] .ju367vm {
            border-radius: var(--rk-radii-actionButton);
          }
          [data-rk] .ju367vn {
            border-radius: var(--rk-radii-connectButton);
          }
          [data-rk] .ju367vo {
            border-radius: var(--rk-radii-menuButton);
          }
          [data-rk] .ju367vp {
            border-radius: var(--rk-radii-modal);
          }
          [data-rk] .ju367vq {
            border-radius: var(--rk-radii-modalMobile);
          }
          [data-rk] .ju367vr {
            border-radius: 25%;
          }
          [data-rk] .ju367vs {
            border-radius: 9999px;
          }
          [data-rk] .ju367vt {
            border-style: solid;
          }
          [data-rk] .ju367vu {
            border-width: 0px;
          }
          [data-rk] .ju367vv {
            border-width: 1px;
          }
          [data-rk] .ju367vw {
            border-width: 2px;
          }
          [data-rk] .ju367vx {
            border-width: 4px;
          }
          [data-rk] .ju367vy {
            cursor: pointer;
          }
          [data-rk] .ju367vz {
            flex-direction: row;
          }
          [data-rk] .ju367v10 {
            flex-direction: column;
          }
          [data-rk] .ju367v11 {
            font-family: var(--rk-fonts-body);
          }
          [data-rk] .ju367v12 {
            font-size: 12px;
            line-height: 18px;
          }
          [data-rk] .ju367v13 {
            font-size: 13px;
            line-height: 18px;
          }
          [data-rk] .ju367v14 {
            font-size: 14px;
            line-height: 18px;
          }
          [data-rk] .ju367v15 {
            font-size: 16px;
            line-height: 20px;
          }
          [data-rk] .ju367v16 {
            font-size: 18px;
            line-height: 24px;
          }
          [data-rk] .ju367v17 {
            font-size: 20px;
            line-height: 24px;
          }
          [data-rk] .ju367v18 {
            font-size: 23px;
            line-height: 29px;
          }
          [data-rk] .ju367v19 {
            font-weight: 400;
          }
          [data-rk] .ju367v1a {
            font-weight: 500;
          }
          [data-rk] .ju367v1b {
            font-weight: 600;
          }
          [data-rk] .ju367v1c {
            font-weight: 700;
          }
          [data-rk] .ju367v1d {
            font-weight: 800;
          }
          [data-rk] .ju367v1e {
            gap: 0;
          }
          [data-rk] .ju367v1f {
            gap: 1px;
          }
          [data-rk] .ju367v1g {
            gap: 2px;
          }
          [data-rk] .ju367v1h {
            gap: 3px;
          }
          [data-rk] .ju367v1i {
            gap: 4px;
          }
          [data-rk] .ju367v1j {
            gap: 5px;
          }
          [data-rk] .ju367v1k {
            gap: 6px;
          }
          [data-rk] .ju367v1l {
            gap: 8px;
          }
          [data-rk] .ju367v1m {
            gap: 10px;
          }
          [data-rk] .ju367v1n {
            gap: 12px;
          }
          [data-rk] .ju367v1o {
            gap: 14px;
          }
          [data-rk] .ju367v1p {
            gap: 16px;
          }
          [data-rk] .ju367v1q {
            gap: 18px;
          }
          [data-rk] .ju367v1r {
            gap: 20px;
          }
          [data-rk] .ju367v1s {
            gap: 24px;
          }
          [data-rk] .ju367v1t {
            gap: 28px;
          }
          [data-rk] .ju367v1u {
            gap: 32px;
          }
          [data-rk] .ju367v1v {
            gap: 36px;
          }
          [data-rk] .ju367v1w {
            gap: 44px;
          }
          [data-rk] .ju367v1x {
            gap: 64px;
          }
          [data-rk] .ju367v1y {
            gap: -1px;
          }
          [data-rk] .ju367v1z {
            height: 1px;
          }
          [data-rk] .ju367v20 {
            height: 2px;
          }
          [data-rk] .ju367v21 {
            height: 4px;
          }
          [data-rk] .ju367v22 {
            height: 8px;
          }
          [data-rk] .ju367v23 {
            height: 12px;
          }
          [data-rk] .ju367v24 {
            height: 20px;
          }
          [data-rk] .ju367v25 {
            height: 24px;
          }
          [data-rk] .ju367v26 {
            height: 28px;
          }
          [data-rk] .ju367v27 {
            height: 30px;
          }
          [data-rk] .ju367v28 {
            height: 32px;
          }
          [data-rk] .ju367v29 {
            height: 34px;
          }
          [data-rk] .ju367v2a {
            height: 36px;
          }
          [data-rk] .ju367v2b {
            height: 40px;
          }
          [data-rk] .ju367v2c {
            height: 44px;
          }
          [data-rk] .ju367v2d {
            height: 48px;
          }
          [data-rk] .ju367v2e {
            height: 54px;
          }
          [data-rk] .ju367v2f {
            height: 60px;
          }
          [data-rk] .ju367v2g {
            height: 200px;
          }
          [data-rk] .ju367v2h {
            height: 100%;
          }
          [data-rk] .ju367v2i {
            height: -moz-max-content;
            height: max-content;
          }
          [data-rk] .ju367v2j {
            justify-content: flex-start;
          }
          [data-rk] .ju367v2k {
            justify-content: flex-end;
          }
          [data-rk] .ju367v2l {
            justify-content: center;
          }
          [data-rk] .ju367v2m {
            justify-content: space-between;
          }
          [data-rk] .ju367v2n {
            justify-content: space-around;
          }
          [data-rk] .ju367v2o {
            text-align: left;
          }
          [data-rk] .ju367v2p {
            text-align: center;
          }
          [data-rk] .ju367v2q {
            text-align: inherit;
          }
          [data-rk] .ju367v2r {
            margin-bottom: 0;
          }
          [data-rk] .ju367v2s {
            margin-bottom: 1px;
          }
          [data-rk] .ju367v2t {
            margin-bottom: 2px;
          }
          [data-rk] .ju367v2u {
            margin-bottom: 3px;
          }
          [data-rk] .ju367v2v {
            margin-bottom: 4px;
          }
          [data-rk] .ju367v2w {
            margin-bottom: 5px;
          }
          [data-rk] .ju367v2x {
            margin-bottom: 6px;
          }
          [data-rk] .ju367v2y {
            margin-bottom: 8px;
          }
          [data-rk] .ju367v2z {
            margin-bottom: 10px;
          }
          [data-rk] .ju367v30 {
            margin-bottom: 12px;
          }
          [data-rk] .ju367v31 {
            margin-bottom: 14px;
          }
          [data-rk] .ju367v32 {
            margin-bottom: 16px;
          }
          [data-rk] .ju367v33 {
            margin-bottom: 18px;
          }
          [data-rk] .ju367v34 {
            margin-bottom: 20px;
          }
          [data-rk] .ju367v35 {
            margin-bottom: 24px;
          }
          [data-rk] .ju367v36 {
            margin-bottom: 28px;
          }
          [data-rk] .ju367v37 {
            margin-bottom: 32px;
          }
          [data-rk] .ju367v38 {
            margin-bottom: 36px;
          }
          [data-rk] .ju367v39 {
            margin-bottom: 44px;
          }
          [data-rk] .ju367v3a {
            margin-bottom: 64px;
          }
          [data-rk] .ju367v3b {
            margin-bottom: -1px;
          }
          [data-rk] .ju367v3c {
            margin-left: 0;
          }
          [data-rk] .ju367v3d {
            margin-left: 1px;
          }
          [data-rk] .ju367v3e {
            margin-left: 2px;
          }
          [data-rk] .ju367v3f {
            margin-left: 3px;
          }
          [data-rk] .ju367v3g {
            margin-left: 4px;
          }
          [data-rk] .ju367v3h {
            margin-left: 5px;
          }
          [data-rk] .ju367v3i {
            margin-left: 6px;
          }
          [data-rk] .ju367v3j {
            margin-left: 8px;
          }
          [data-rk] .ju367v3k {
            margin-left: 10px;
          }
          [data-rk] .ju367v3l {
            margin-left: 12px;
          }
          [data-rk] .ju367v3m {
            margin-left: 14px;
          }
          [data-rk] .ju367v3n {
            margin-left: 16px;
          }
          [data-rk] .ju367v3o {
            margin-left: 18px;
          }
          [data-rk] .ju367v3p {
            margin-left: 20px;
          }
          [data-rk] .ju367v3q {
            margin-left: 24px;
          }
          [data-rk] .ju367v3r {
            margin-left: 28px;
          }
          [data-rk] .ju367v3s {
            margin-left: 32px;
          }
          [data-rk] .ju367v3t {
            margin-left: 36px;
          }
          [data-rk] .ju367v3u {
            margin-left: 44px;
          }
          [data-rk] .ju367v3v {
            margin-left: 64px;
          }
          [data-rk] .ju367v3w {
            margin-left: -1px;
          }
          [data-rk] .ju367v3x {
            margin-right: 0;
          }
          [data-rk] .ju367v3y {
            margin-right: 1px;
          }
          [data-rk] .ju367v3z {
            margin-right: 2px;
          }
          [data-rk] .ju367v40 {
            margin-right: 3px;
          }
          [data-rk] .ju367v41 {
            margin-right: 4px;
          }
          [data-rk] .ju367v42 {
            margin-right: 5px;
          }
          [data-rk] .ju367v43 {
            margin-right: 6px;
          }
          [data-rk] .ju367v44 {
            margin-right: 8px;
          }
          [data-rk] .ju367v45 {
            margin-right: 10px;
          }
          [data-rk] .ju367v46 {
            margin-right: 12px;
          }
          [data-rk] .ju367v47 {
            margin-right: 14px;
          }
          [data-rk] .ju367v48 {
            margin-right: 16px;
          }
          [data-rk] .ju367v49 {
            margin-right: 18px;
          }
          [data-rk] .ju367v4a {
            margin-right: 20px;
          }
          [data-rk] .ju367v4b {
            margin-right: 24px;
          }
          [data-rk] .ju367v4c {
            margin-right: 28px;
          }
          [data-rk] .ju367v4d {
            margin-right: 32px;
          }
          [data-rk] .ju367v4e {
            margin-right: 36px;
          }
          [data-rk] .ju367v4f {
            margin-right: 44px;
          }
          [data-rk] .ju367v4g {
            margin-right: 64px;
          }
          [data-rk] .ju367v4h {
            margin-right: -1px;
          }
          [data-rk] .ju367v4i {
            margin-top: 0;
          }
          [data-rk] .ju367v4j {
            margin-top: 1px;
          }
          [data-rk] .ju367v4k {
            margin-top: 2px;
          }
          [data-rk] .ju367v4l {
            margin-top: 3px;
          }
          [data-rk] .ju367v4m {
            margin-top: 4px;
          }
          [data-rk] .ju367v4n {
            margin-top: 5px;
          }
          [data-rk] .ju367v4o {
            margin-top: 6px;
          }
          [data-rk] .ju367v4p {
            margin-top: 8px;
          }
          [data-rk] .ju367v4q {
            margin-top: 10px;
          }
          [data-rk] .ju367v4r {
            margin-top: 12px;
          }
          [data-rk] .ju367v4s {
            margin-top: 14px;
          }
          [data-rk] .ju367v4t {
            margin-top: 16px;
          }
          [data-rk] .ju367v4u {
            margin-top: 18px;
          }
          [data-rk] .ju367v4v {
            margin-top: 20px;
          }
          [data-rk] .ju367v4w {
            margin-top: 24px;
          }
          [data-rk] .ju367v4x {
            margin-top: 28px;
          }
          [data-rk] .ju367v4y {
            margin-top: 32px;
          }
          [data-rk] .ju367v4z {
            margin-top: 36px;
          }
          [data-rk] .ju367v50 {
            margin-top: 44px;
          }
          [data-rk] .ju367v51 {
            margin-top: 64px;
          }
          [data-rk] .ju367v52 {
            margin-top: -1px;
          }
          [data-rk] .ju367v53 {
            max-width: 1px;
          }
          [data-rk] .ju367v54 {
            max-width: 2px;
          }
          [data-rk] .ju367v55 {
            max-width: 4px;
          }
          [data-rk] .ju367v56 {
            max-width: 8px;
          }
          [data-rk] .ju367v57 {
            max-width: 12px;
          }
          [data-rk] .ju367v58 {
            max-width: 20px;
          }
          [data-rk] .ju367v59 {
            max-width: 24px;
          }
          [data-rk] .ju367v5a {
            max-width: 28px;
          }
          [data-rk] .ju367v5b {
            max-width: 30px;
          }
          [data-rk] .ju367v5c {
            max-width: 32px;
          }
          [data-rk] .ju367v5d {
            max-width: 34px;
          }
          [data-rk] .ju367v5e {
            max-width: 36px;
          }
          [data-rk] .ju367v5f {
            max-width: 40px;
          }
          [data-rk] .ju367v5g {
            max-width: 44px;
          }
          [data-rk] .ju367v5h {
            max-width: 48px;
          }
          [data-rk] .ju367v5i {
            max-width: 54px;
          }
          [data-rk] .ju367v5j {
            max-width: 60px;
          }
          [data-rk] .ju367v5k {
            max-width: 200px;
          }
          [data-rk] .ju367v5l {
            max-width: 100%;
          }
          [data-rk] .ju367v5m {
            max-width: -moz-max-content;
            max-width: max-content;
          }
          [data-rk] .ju367v5n {
            min-width: 1px;
          }
          [data-rk] .ju367v5o {
            min-width: 2px;
          }
          [data-rk] .ju367v5p {
            min-width: 4px;
          }
          [data-rk] .ju367v5q {
            min-width: 8px;
          }
          [data-rk] .ju367v5r {
            min-width: 12px;
          }
          [data-rk] .ju367v5s {
            min-width: 20px;
          }
          [data-rk] .ju367v5t {
            min-width: 24px;
          }
          [data-rk] .ju367v5u {
            min-width: 28px;
          }
          [data-rk] .ju367v5v {
            min-width: 30px;
          }
          [data-rk] .ju367v5w {
            min-width: 32px;
          }
          [data-rk] .ju367v5x {
            min-width: 34px;
          }
          [data-rk] .ju367v5y {
            min-width: 36px;
          }
          [data-rk] .ju367v5z {
            min-width: 40px;
          }
          [data-rk] .ju367v60 {
            min-width: 44px;
          }
          [data-rk] .ju367v61 {
            min-width: 48px;
          }
          [data-rk] .ju367v62 {
            min-width: 54px;
          }
          [data-rk] .ju367v63 {
            min-width: 60px;
          }
          [data-rk] .ju367v64 {
            min-width: 200px;
          }
          [data-rk] .ju367v65 {
            min-width: 100%;
          }
          [data-rk] .ju367v66 {
            min-width: -moz-max-content;
            min-width: max-content;
          }
          [data-rk] .ju367v67 {
            overflow: hidden;
          }
          [data-rk] .ju367v68 {
            padding-bottom: 0;
          }
          [data-rk] .ju367v69 {
            padding-bottom: 1px;
          }
          [data-rk] .ju367v6a {
            padding-bottom: 2px;
          }
          [data-rk] .ju367v6b {
            padding-bottom: 3px;
          }
          [data-rk] .ju367v6c {
            padding-bottom: 4px;
          }
          [data-rk] .ju367v6d {
            padding-bottom: 5px;
          }
          [data-rk] .ju367v6e {
            padding-bottom: 6px;
          }
          [data-rk] .ju367v6f {
            padding-bottom: 8px;
          }
          [data-rk] .ju367v6g {
            padding-bottom: 10px;
          }
          [data-rk] .ju367v6h {
            padding-bottom: 12px;
          }
          [data-rk] .ju367v6i {
            padding-bottom: 14px;
          }
          [data-rk] .ju367v6j {
            padding-bottom: 16px;
          }
          [data-rk] .ju367v6k {
            padding-bottom: 18px;
          }
          [data-rk] .ju367v6l {
            padding-bottom: 20px;
          }
          [data-rk] .ju367v6m {
            padding-bottom: 24px;
          }
          [data-rk] .ju367v6n {
            padding-bottom: 28px;
          }
          [data-rk] .ju367v6o {
            padding-bottom: 32px;
          }
          [data-rk] .ju367v6p {
            padding-bottom: 36px;
          }
          [data-rk] .ju367v6q {
            padding-bottom: 44px;
          }
          [data-rk] .ju367v6r {
            padding-bottom: 64px;
          }
          [data-rk] .ju367v6s {
            padding-bottom: -1px;
          }
          [data-rk] .ju367v6t {
            padding-left: 0;
          }
          [data-rk] .ju367v6u {
            padding-left: 1px;
          }
          [data-rk] .ju367v6v {
            padding-left: 2px;
          }
          [data-rk] .ju367v6w {
            padding-left: 3px;
          }
          [data-rk] .ju367v6x {
            padding-left: 4px;
          }
          [data-rk] .ju367v6y {
            padding-left: 5px;
          }
          [data-rk] .ju367v6z {
            padding-left: 6px;
          }
          [data-rk] .ju367v70 {
            padding-left: 8px;
          }
          [data-rk] .ju367v71 {
            padding-left: 10px;
          }
          [data-rk] .ju367v72 {
            padding-left: 12px;
          }
          [data-rk] .ju367v73 {
            padding-left: 14px;
          }
          [data-rk] .ju367v74 {
            padding-left: 16px;
          }
          [data-rk] .ju367v75 {
            padding-left: 18px;
          }
          [data-rk] .ju367v76 {
            padding-left: 20px;
          }
          [data-rk] .ju367v77 {
            padding-left: 24px;
          }
          [data-rk] .ju367v78 {
            padding-left: 28px;
          }
          [data-rk] .ju367v79 {
            padding-left: 32px;
          }
          [data-rk] .ju367v7a {
            padding-left: 36px;
          }
          [data-rk] .ju367v7b {
            padding-left: 44px;
          }
          [data-rk] .ju367v7c {
            padding-left: 64px;
          }
          [data-rk] .ju367v7d {
            padding-left: -1px;
          }
          [data-rk] .ju367v7e {
            padding-right: 0;
          }
          [data-rk] .ju367v7f {
            padding-right: 1px;
          }
          [data-rk] .ju367v7g {
            padding-right: 2px;
          }
          [data-rk] .ju367v7h {
            padding-right: 3px;
          }
          [data-rk] .ju367v7i {
            padding-right: 4px;
          }
          [data-rk] .ju367v7j {
            padding-right: 5px;
          }
          [data-rk] .ju367v7k {
            padding-right: 6px;
          }
          [data-rk] .ju367v7l {
            padding-right: 8px;
          }
          [data-rk] .ju367v7m {
            padding-right: 10px;
          }
          [data-rk] .ju367v7n {
            padding-right: 12px;
          }
          [data-rk] .ju367v7o {
            padding-right: 14px;
          }
          [data-rk] .ju367v7p {
            padding-right: 16px;
          }
          [data-rk] .ju367v7q {
            padding-right: 18px;
          }
          [data-rk] .ju367v7r {
            padding-right: 20px;
          }
          [data-rk] .ju367v7s {
            padding-right: 24px;
          }
          [data-rk] .ju367v7t {
            padding-right: 28px;
          }
          [data-rk] .ju367v7u {
            padding-right: 32px;
          }
          [data-rk] .ju367v7v {
            padding-right: 36px;
          }
          [data-rk] .ju367v7w {
            padding-right: 44px;
          }
          [data-rk] .ju367v7x {
            padding-right: 64px;
          }
          [data-rk] .ju367v7y {
            padding-right: -1px;
          }
          [data-rk] .ju367v7z {
            padding-top: 0;
          }
          [data-rk] .ju367v80 {
            padding-top: 1px;
          }
          [data-rk] .ju367v81 {
            padding-top: 2px;
          }
          [data-rk] .ju367v82 {
            padding-top: 3px;
          }
          [data-rk] .ju367v83 {
            padding-top: 4px;
          }
          [data-rk] .ju367v84 {
            padding-top: 5px;
          }
          [data-rk] .ju367v85 {
            padding-top: 6px;
          }
          [data-rk] .ju367v86 {
            padding-top: 8px;
          }
          [data-rk] .ju367v87 {
            padding-top: 10px;
          }
          [data-rk] .ju367v88 {
            padding-top: 12px;
          }
          [data-rk] .ju367v89 {
            padding-top: 14px;
          }
          [data-rk] .ju367v8a {
            padding-top: 16px;
          }
          [data-rk] .ju367v8b {
            padding-top: 18px;
          }
          [data-rk] .ju367v8c {
            padding-top: 20px;
          }
          [data-rk] .ju367v8d {
            padding-top: 24px;
          }
          [data-rk] .ju367v8e {
            padding-top: 28px;
          }
          [data-rk] .ju367v8f {
            padding-top: 32px;
          }
          [data-rk] .ju367v8g {
            padding-top: 36px;
          }
          [data-rk] .ju367v8h {
            padding-top: 44px;
          }
          [data-rk] .ju367v8i {
            padding-top: 64px;
          }
          [data-rk] .ju367v8j {
            padding-top: -1px;
          }
          [data-rk] .ju367v8k {
            position: absolute;
          }
          [data-rk] .ju367v8l {
            position: fixed;
          }
          [data-rk] .ju367v8m {
            position: relative;
          }
          [data-rk] .ju367v8n {
            right: 0;
          }
          [data-rk] .ju367v8o {
            transition: 0.125s ease;
          }
          [data-rk] .ju367v8p {
            transition: transform 0.125s ease;
          }
          [data-rk] .ju367v8q {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          [data-rk] .ju367v8r {
            width: 1px;
          }
          [data-rk] .ju367v8s {
            width: 2px;
          }
          [data-rk] .ju367v8t {
            width: 4px;
          }
          [data-rk] .ju367v8u {
            width: 8px;
          }
          [data-rk] .ju367v8v {
            width: 12px;
          }
          [data-rk] .ju367v8w {
            width: 20px;
          }
          [data-rk] .ju367v8x {
            width: 24px;
          }
          [data-rk] .ju367v8y {
            width: 28px;
          }
          [data-rk] .ju367v8z {
            width: 30px;
          }
          [data-rk] .ju367v90 {
            width: 32px;
          }
          [data-rk] .ju367v91 {
            width: 34px;
          }
          [data-rk] .ju367v92 {
            width: 36px;
          }
          [data-rk] .ju367v93 {
            width: 40px;
          }
          [data-rk] .ju367v94 {
            width: 44px;
          }
          [data-rk] .ju367v95 {
            width: 48px;
          }
          [data-rk] .ju367v96 {
            width: 54px;
          }
          [data-rk] .ju367v97 {
            width: 60px;
          }
          [data-rk] .ju367v98 {
            width: 200px;
          }
          [data-rk] .ju367v99 {
            width: 100%;
          }
          [data-rk] .ju367v9a {
            width: -moz-max-content;
            width: max-content;
          }
          [data-rk] .ju367v9b {
            -webkit-backdrop-filter: var(--rk-blurs-modalOverlay);
            backdrop-filter: var(--rk-blurs-modalOverlay);
          }
          [data-rk] .ju367v9c {
            background: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367v9d:hover {
            background: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367v9e:active {
            background: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367v9f {
            background: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367v9g:hover {
            background: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367v9h:active {
            background: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367v9i {
            background: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367v9j:hover {
            background: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367v9k:active {
            background: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367v9l {
            background: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367v9m:hover {
            background: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367v9n:active {
            background: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367v9o {
            background: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367v9p:hover {
            background: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367v9q:active {
            background: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367v9r {
            background: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367v9s:hover {
            background: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367v9t:active {
            background: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367v9u {
            background: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367v9v:hover {
            background: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367v9w:active {
            background: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367v9x {
            background: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367v9y:hover {
            background: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367v9z:active {
            background: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367va0 {
            background: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367va1:hover {
            background: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367va2:active {
            background: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367va3 {
            background: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367va4:hover {
            background: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367va5:active {
            background: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367va6 {
            background: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367va7:hover {
            background: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367va8:active {
            background: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367va9 {
            background: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vaa:hover {
            background: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vab:active {
            background: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vac {
            background: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vad:hover {
            background: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vae:active {
            background: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vaf {
            background: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vag:hover {
            background: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vah:active {
            background: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vai {
            background: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vaj:hover {
            background: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vak:active {
            background: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367val {
            background: var(--rk-colors-error);
          }
          [data-rk] .ju367vam:hover {
            background: var(--rk-colors-error);
          }
          [data-rk] .ju367van:active {
            background: var(--rk-colors-error);
          }
          [data-rk] .ju367vao {
            background: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vap:hover {
            background: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vaq:active {
            background: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367var {
            background: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vas:hover {
            background: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vat:active {
            background: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vau {
            background: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vav:hover {
            background: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vaw:active {
            background: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vax {
            background: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vay:hover {
            background: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vaz:active {
            background: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vb0 {
            background: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vb1:hover {
            background: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vb2:active {
            background: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vb3 {
            background: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vb4:hover {
            background: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vb5:active {
            background: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vb6 {
            background: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vb7:hover {
            background: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vb8:active {
            background: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vb9 {
            background: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vba:hover {
            background: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vbb:active {
            background: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vbc {
            background: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vbd:hover {
            background: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vbe:active {
            background: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vbf {
            background: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vbg:hover {
            background: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vbh:active {
            background: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vbi {
            background: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367vbj:hover {
            background: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367vbk:active {
            background: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367vbl {
            background: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367vbm:hover {
            background: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367vbn:active {
            background: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367vbo {
            background: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367vbp:hover {
            background: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367vbq:active {
            background: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367vbr {
            background: var(--rk-colors-standby);
          }
          [data-rk] .ju367vbs:hover {
            background: var(--rk-colors-standby);
          }
          [data-rk] .ju367vbt:active {
            background: var(--rk-colors-standby);
          }
          [data-rk] .ju367vbu {
            border-color: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367vbv:hover {
            border-color: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367vbw:active {
            border-color: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367vbx {
            border-color: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367vby:hover {
            border-color: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367vbz:active {
            border-color: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367vc0 {
            border-color: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367vc1:hover {
            border-color: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367vc2:active {
            border-color: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367vc3 {
            border-color: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367vc4:hover {
            border-color: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367vc5:active {
            border-color: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367vc6 {
            border-color: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367vc7:hover {
            border-color: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367vc8:active {
            border-color: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367vc9 {
            border-color: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367vca:hover {
            border-color: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367vcb:active {
            border-color: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367vcc {
            border-color: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367vcd:hover {
            border-color: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367vce:active {
            border-color: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367vcf {
            border-color: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367vcg:hover {
            border-color: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367vch:active {
            border-color: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367vci {
            border-color: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367vcj:hover {
            border-color: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367vck:active {
            border-color: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367vcl {
            border-color: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367vcm:hover {
            border-color: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367vcn:active {
            border-color: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367vco {
            border-color: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367vcp:hover {
            border-color: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367vcq:active {
            border-color: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367vcr {
            border-color: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vcs:hover {
            border-color: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vct:active {
            border-color: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vcu {
            border-color: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vcv:hover {
            border-color: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vcw:active {
            border-color: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vcx {
            border-color: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vcy:hover {
            border-color: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vcz:active {
            border-color: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vd0 {
            border-color: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vd1:hover {
            border-color: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vd2:active {
            border-color: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vd3 {
            border-color: var(--rk-colors-error);
          }
          [data-rk] .ju367vd4:hover {
            border-color: var(--rk-colors-error);
          }
          [data-rk] .ju367vd5:active {
            border-color: var(--rk-colors-error);
          }
          [data-rk] .ju367vd6 {
            border-color: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vd7:hover {
            border-color: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vd8:active {
            border-color: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vd9 {
            border-color: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vda:hover {
            border-color: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vdb:active {
            border-color: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vdc {
            border-color: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vdd:hover {
            border-color: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vde:active {
            border-color: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vdf {
            border-color: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vdg:hover {
            border-color: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vdh:active {
            border-color: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vdi {
            border-color: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vdj:hover {
            border-color: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vdk:active {
            border-color: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vdl {
            border-color: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vdm:hover {
            border-color: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vdn:active {
            border-color: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vdo {
            border-color: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vdp:hover {
            border-color: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vdq:active {
            border-color: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vdr {
            border-color: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vds:hover {
            border-color: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vdt:active {
            border-color: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vdu {
            border-color: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vdv:hover {
            border-color: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vdw:active {
            border-color: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vdx {
            border-color: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vdy:hover {
            border-color: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vdz:active {
            border-color: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367ve0 {
            border-color: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367ve1:hover {
            border-color: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367ve2:active {
            border-color: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367ve3 {
            border-color: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367ve4:hover {
            border-color: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367ve5:active {
            border-color: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367ve6 {
            border-color: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367ve7:hover {
            border-color: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367ve8:active {
            border-color: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367ve9 {
            border-color: var(--rk-colors-standby);
          }
          [data-rk] .ju367vea:hover {
            border-color: var(--rk-colors-standby);
          }
          [data-rk] .ju367veb:active {
            border-color: var(--rk-colors-standby);
          }
          [data-rk] .ju367vec {
            box-shadow: var(--rk-shadows-connectButton);
          }
          [data-rk] .ju367ved:hover {
            box-shadow: var(--rk-shadows-connectButton);
          }
          [data-rk] .ju367vee:active {
            box-shadow: var(--rk-shadows-connectButton);
          }
          [data-rk] .ju367vef {
            box-shadow: var(--rk-shadows-dialog);
          }
          [data-rk] .ju367veg:hover {
            box-shadow: var(--rk-shadows-dialog);
          }
          [data-rk] .ju367veh:active {
            box-shadow: var(--rk-shadows-dialog);
          }
          [data-rk] .ju367vei {
            box-shadow: var(--rk-shadows-profileDetailsAction);
          }
          [data-rk] .ju367vej:hover {
            box-shadow: var(--rk-shadows-profileDetailsAction);
          }
          [data-rk] .ju367vek:active {
            box-shadow: var(--rk-shadows-profileDetailsAction);
          }
          [data-rk] .ju367vel {
            box-shadow: var(--rk-shadows-selectedOption);
          }
          [data-rk] .ju367vem:hover {
            box-shadow: var(--rk-shadows-selectedOption);
          }
          [data-rk] .ju367ven:active {
            box-shadow: var(--rk-shadows-selectedOption);
          }
          [data-rk] .ju367veo {
            box-shadow: var(--rk-shadows-selectedWallet);
          }
          [data-rk] .ju367vep:hover {
            box-shadow: var(--rk-shadows-selectedWallet);
          }
          [data-rk] .ju367veq:active {
            box-shadow: var(--rk-shadows-selectedWallet);
          }
          [data-rk] .ju367ver {
            box-shadow: var(--rk-shadows-walletLogo);
          }
          [data-rk] .ju367ves:hover {
            box-shadow: var(--rk-shadows-walletLogo);
          }
          [data-rk] .ju367vet:active {
            box-shadow: var(--rk-shadows-walletLogo);
          }
          [data-rk] .ju367veu {
            color: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367vev:hover {
            color: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367vew:active {
            color: var(--rk-colors-accentColor);
          }
          [data-rk] .ju367vex {
            color: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367vey:hover {
            color: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367vez:active {
            color: var(--rk-colors-accentColorForeground);
          }
          [data-rk] .ju367vf0 {
            color: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367vf1:hover {
            color: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367vf2:active {
            color: var(--rk-colors-actionButtonBorder);
          }
          [data-rk] .ju367vf3 {
            color: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367vf4:hover {
            color: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367vf5:active {
            color: var(--rk-colors-actionButtonBorderMobile);
          }
          [data-rk] .ju367vf6 {
            color: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367vf7:hover {
            color: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367vf8:active {
            color: var(--rk-colors-actionButtonSecondaryBackground);
          }
          [data-rk] .ju367vf9 {
            color: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367vfa:hover {
            color: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367vfb:active {
            color: var(--rk-colors-closeButton);
          }
          [data-rk] .ju367vfc {
            color: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367vfd:hover {
            color: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367vfe:active {
            color: var(--rk-colors-closeButtonBackground);
          }
          [data-rk] .ju367vff {
            color: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367vfg:hover {
            color: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367vfh:active {
            color: var(--rk-colors-connectButtonBackground);
          }
          [data-rk] .ju367vfi {
            color: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367vfj:hover {
            color: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367vfk:active {
            color: var(--rk-colors-connectButtonBackgroundError);
          }
          [data-rk] .ju367vfl {
            color: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367vfm:hover {
            color: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367vfn:active {
            color: var(--rk-colors-connectButtonInnerBackground);
          }
          [data-rk] .ju367vfo {
            color: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367vfp:hover {
            color: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367vfq:active {
            color: var(--rk-colors-connectButtonText);
          }
          [data-rk] .ju367vfr {
            color: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vfs:hover {
            color: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vft:active {
            color: var(--rk-colors-connectButtonTextError);
          }
          [data-rk] .ju367vfu {
            color: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vfv:hover {
            color: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vfw:active {
            color: var(--rk-colors-connectionIndicator);
          }
          [data-rk] .ju367vfx {
            color: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vfy:hover {
            color: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vfz:active {
            color: var(--rk-colors-downloadBottomCardBackground);
          }
          [data-rk] .ju367vg0 {
            color: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vg1:hover {
            color: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vg2:active {
            color: var(--rk-colors-downloadTopCardBackground);
          }
          [data-rk] .ju367vg3 {
            color: var(--rk-colors-error);
          }
          [data-rk] .ju367vg4:hover {
            color: var(--rk-colors-error);
          }
          [data-rk] .ju367vg5:active {
            color: var(--rk-colors-error);
          }
          [data-rk] .ju367vg6 {
            color: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vg7:hover {
            color: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vg8:active {
            color: var(--rk-colors-generalBorder);
          }
          [data-rk] .ju367vg9 {
            color: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vga:hover {
            color: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vgb:active {
            color: var(--rk-colors-generalBorderDim);
          }
          [data-rk] .ju367vgc {
            color: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vgd:hover {
            color: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vge:active {
            color: var(--rk-colors-menuItemBackground);
          }
          [data-rk] .ju367vgf {
            color: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vgg:hover {
            color: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vgh:active {
            color: var(--rk-colors-modalBackdrop);
          }
          [data-rk] .ju367vgi {
            color: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vgj:hover {
            color: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vgk:active {
            color: var(--rk-colors-modalBackground);
          }
          [data-rk] .ju367vgl {
            color: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vgm:hover {
            color: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vgn:active {
            color: var(--rk-colors-modalBorder);
          }
          [data-rk] .ju367vgo {
            color: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vgp:hover {
            color: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vgq:active {
            color: var(--rk-colors-modalText);
          }
          [data-rk] .ju367vgr {
            color: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vgs:hover {
            color: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vgt:active {
            color: var(--rk-colors-modalTextDim);
          }
          [data-rk] .ju367vgu {
            color: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vgv:hover {
            color: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vgw:active {
            color: var(--rk-colors-modalTextSecondary);
          }
          [data-rk] .ju367vgx {
            color: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vgy:hover {
            color: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vgz:active {
            color: var(--rk-colors-profileAction);
          }
          [data-rk] .ju367vh0 {
            color: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367vh1:hover {
            color: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367vh2:active {
            color: var(--rk-colors-profileActionHover);
          }
          [data-rk] .ju367vh3 {
            color: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367vh4:hover {
            color: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367vh5:active {
            color: var(--rk-colors-profileForeground);
          }
          [data-rk] .ju367vh6 {
            color: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367vh7:hover {
            color: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367vh8:active {
            color: var(--rk-colors-selectedOptionBorder);
          }
          [data-rk] .ju367vh9 {
            color: var(--rk-colors-standby);
          }
          [data-rk] .ju367vha:hover {
            color: var(--rk-colors-standby);
          }
          [data-rk] .ju367vhb:active {
            color: var(--rk-colors-standby);
          }
          @media screen and (min-width: 768px) {
            [data-rk] .ju367v1 {
              align-items: flex-start;
            }
            [data-rk] .ju367v3 {
              align-items: flex-end;
            }
            [data-rk] .ju367v5 {
              align-items: center;
            }
            [data-rk] .ju367v7 {
              display: none;
            }
            [data-rk] .ju367v9 {
              display: block;
            }
            [data-rk] .ju367vb {
              display: flex;
            }
            [data-rk] .ju367vd {
              display: inline;
            }
          }

          /* vanilla-extract-css-ns:src/css/touchableStyles.css.ts.vanilla.css?source=Ll8xMmNibzhpMywuXzEyY2JvOGkzOjphZnRlciB7CiAgLS1fMTJjYm84aTA6IDE7CiAgLS1fMTJjYm84aTE6IDE7Cn0KLl8xMmNibzhpMzpob3ZlciB7CiAgdHJhbnNmb3JtOiBzY2FsZSh2YXIoLS1fMTJjYm84aTApKTsKfQouXzEyY2JvOGkzOmFjdGl2ZSB7CiAgdHJhbnNmb3JtOiBzY2FsZSh2YXIoLS1fMTJjYm84aTEpKTsKfQouXzEyY2JvOGkzOmFjdGl2ZTo6YWZ0ZXIgewogIGNvbnRlbnQ6ICIiOwogIGJvdHRvbTogLTFweDsKICBkaXNwbGF5OiBibG9jazsKICBsZWZ0OiAtMXB4OwogIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICByaWdodDogLTFweDsKICB0b3A6IC0xcHg7CiAgdHJhbnNmb3JtOiBzY2FsZShjYWxjKCgxIC8gdmFyKC0tXzEyY2JvOGkxKSkgKiB2YXIoLS1fMTJjYm84aTApKSk7Cn0KLl8xMmNibzhpNCwuXzEyY2JvOGk0OjphZnRlciB7CiAgLS1fMTJjYm84aTA6IDEuMDI1Owp9Ci5fMTJjYm84aTUsLl8xMmNibzhpNTo6YWZ0ZXIgewogIC0tXzEyY2JvOGkwOiAxLjE7Cn0KLl8xMmNibzhpNiwuXzEyY2JvOGk2OjphZnRlciB7CiAgLS1fMTJjYm84aTE6IDAuOTU7Cn0KLl8xMmNibzhpNywuXzEyY2JvOGk3OjphZnRlciB7CiAgLS1fMTJjYm84aTE6IDAuOTsKfQ== */
          [data-rk] ._12cbo8i3,
          [data-rk] ._12cbo8i3::after {
            --_12cbo8i0: 1;
            --_12cbo8i1: 1;
          }
          [data-rk] ._12cbo8i3:hover {
            transform: scale(var(--_12cbo8i0));
          }
          [data-rk] ._12cbo8i3:active {
            transform: scale(var(--_12cbo8i1));
          }
          [data-rk] ._12cbo8i3:active::after {
            content: "";
            bottom: -1px;
            display: block;
            left: -1px;
            position: absolute;
            right: -1px;
            top: -1px;
            transform: scale(calc((1 / var(--_12cbo8i1)) * var(--_12cbo8i0)));
          }
          [data-rk] ._12cbo8i4,
          [data-rk] ._12cbo8i4::after {
            --_12cbo8i0: 1.025;
          }
          [data-rk] ._12cbo8i5,
          [data-rk] ._12cbo8i5::after {
            --_12cbo8i0: 1.1;
          }
          [data-rk] ._12cbo8i6,
          [data-rk] ._12cbo8i6::after {
            --_12cbo8i1: 0.95;
          }
          [data-rk] ._12cbo8i7,
          [data-rk] ._12cbo8i7::after {
            --_12cbo8i1: 0.9;
          }

          /* vanilla-extract-css-ns:src/components/Icons/Icons.css.ts.vanilla.css?source=QGtleWZyYW1lcyBfMWx1dWxlNDEgewogIDAlIHsKICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOwogIH0KICAxMDAlIHsKICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7CiAgfQp9Ci5fMWx1dWxlNDIgewogIGFuaW1hdGlvbjogXzFsdXVsZTQxIDNzIGluZmluaXRlIGxpbmVhcjsKfQouXzFsdXVsZTQzIHsKICBiYWNrZ3JvdW5kOiBjb25pYy1ncmFkaWVudChmcm9tIDE4MGRlZyBhdCA1MCUgNTAlLCByZ2JhKDcyLCAxNDYsIDI1NCwgMCkgMGRlZywgY3VycmVudENvbG9yIDI4Mi4wNGRlZywgcmdiYSg3MiwgMTQ2LCAyNTQsIDApIDMxOS44NmRlZywgcmdiYSg3MiwgMTQ2LCAyNTQsIDApIDM2MGRlZyk7CiAgaGVpZ2h0OiAyMXB4OwogIHdpZHRoOiAyMXB4Owp9 */
          @keyframes _1luule41 {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          [data-rk] ._1luule42 {
            animation: _1luule41 3s infinite linear;
          }
          [data-rk] ._1luule43 {
            background: conic-gradient(from 180deg at 50% 50%, rgba(72, 146, 254, 0) 0deg, currentColor 282.04deg, rgba(72, 146, 254, 0) 319.86deg, rgba(72, 146, 254, 0) 360deg);
            height: 21px;
            width: 21px;
          }

          /* vanilla-extract-css-ns:src/components/Dialog/Dialog.css.ts.vanilla.css?source=QGtleWZyYW1lcyBfOXBtNGtpMCB7CiAgMCUgewogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpOwogIH0KICAxMDAlIHsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsKICB9Cn0KQGtleWZyYW1lcyBfOXBtNGtpMSB7CiAgMCUgewogICAgb3BhY2l0eTogMDsKICB9CiAgMTAwJSB7CiAgICBvcGFjaXR5OiAxOwogIH0KfQouXzlwbTRraTMgewogIGFuaW1hdGlvbjogXzlwbTRraTEgMTUwbXMgZWFzZTsKICBib3R0b206IC0yMDBweDsKICBsZWZ0OiAtMjAwcHg7CiAgcGFkZGluZzogMjAwcHg7CiAgcmlnaHQ6IC0yMDBweDsKICB0b3A6IC0yMDBweDsKICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCk7CiAgei1pbmRleDogMjE0NzQ4MzY0NjsKfQouXzlwbTRraTUgewogIGFuaW1hdGlvbjogXzlwbTRraTAgMzUwbXMgY3ViaWMtYmV6aWVyKC4xNSwxLjE1LDAuNiwxLjAwKSwgXzlwbTRraTEgMTUwbXMgZWFzZTsKICBtYXgtd2lkdGg6IDEwMHZ3Owp9 */
          @keyframes _9pm4ki0 {
            0% {
              transform: translateY(100%);
            }
            100% {
              transform: translateY(0);
            }
          }
          @keyframes _9pm4ki1 {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          [data-rk] ._9pm4ki3 {
            animation: _9pm4ki1 150ms ease;
            bottom: -200px;
            left: -200px;
            padding: 200px;
            right: -200px;
            top: -200px;
            transform: translateZ(0);
            z-index: 2147483646;
          }
          [data-rk] ._9pm4ki5 {
            animation: _9pm4ki0 350ms cubic-bezier(.15, 1.15, 0.6, 1.00), _9pm4ki1 150ms ease;
            max-width: 100vw;
          }

          /* vanilla-extract-css-ns:src/components/Dialog/DialogContent.css.ts.vanilla.css?source=Ll8xY2tqcG9rMSB7CiAgYm94LXNpemluZzogY29udGVudC1ib3g7CiAgbWF4LXdpZHRoOiAxMDB2dzsKICB3aWR0aDogMzYwcHg7Cn0KLl8xY2tqcG9rMiB7CiAgd2lkdGg6IDEwMHZ3Owp9Ci5fMWNranBvazMgewogIHdpZHRoOiA3NjhweDsKfQouXzFja2pwb2s0IHsKICBtaW4td2lkdGg6IDM2OHB4OwogIHdpZHRoOiAzNjhweDsKfQouXzFja2pwb2s2IHsKICBib3JkZXItd2lkdGg6IDBweDsKICBib3gtc2l6aW5nOiBib3JkZXItYm94OwogIHdpZHRoOiAxMDB2dzsKfQpAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA3NjhweCkgewogIC5fMWNranBvazEgewogICAgd2lkdGg6IDM2MHB4OwogIH0KICAuXzFja2pwb2syIHsKICAgIHdpZHRoOiA0ODBweDsKICB9CiAgLl8xY2tqcG9rMyB7CiAgICB3aWR0aDogNzIwcHg7CiAgfQogIC5fMWNranBvazQgewogICAgbWluLXdpZHRoOiAzNjhweDsKICAgIHdpZHRoOiAzNjhweDsKICB9Cn0KQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHsKICAuXzFja2pwb2s3IHsKICAgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDA7CiAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMDsKICAgIG1hcmdpbi10b3A6IC0yMDBweDsKICAgIHBhZGRpbmctYm90dG9tOiAyMDBweDsKICAgIHRvcDogMjAwcHg7CiAgfQp9 */
          [data-rk] ._1ckjpok1 {
            box-sizing: content-box;
            max-width: 100vw;
            width: 360px;
          }
          [data-rk] ._1ckjpok2 {
            width: 100vw;
          }
          [data-rk] ._1ckjpok3 {
            width: 768px;
          }
          [data-rk] ._1ckjpok4 {
            min-width: 368px;
            width: 368px;
          }
          [data-rk] ._1ckjpok6 {
            border-width: 0px;
            box-sizing: border-box;
            width: 100vw;
          }
          @media screen and (min-width: 768px) {
            [data-rk] ._1ckjpok1 {
              width: 360px;
            }
            [data-rk] ._1ckjpok2 {
              width: 480px;
            }
            [data-rk] ._1ckjpok3 {
              width: 720px;
            }
            [data-rk] ._1ckjpok4 {
              min-width: 368px;
              width: 368px;
            }
          }
          @media screen and (max-width: 767px) {
            [data-rk] ._1ckjpok7 {
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
              margin-top: -200px;
              padding-bottom: 200px;
              top: 200px;
            }
          }

          /* vanilla-extract-css-ns:src/components/MenuButton/MenuButton.css.ts.vanilla.css?source=LnY5aG9yYjA6aG92ZXIgewogIGJhY2tncm91bmQ6IHVuc2V0Owp9 */
          [data-rk] .v9horb0:hover {
            background: unset;
          }

          /* vanilla-extract-css-ns:src/components/ModalSelection/ModalSelection.css.ts.vanilla.css?source=Lmc1a2wwbDAgewogIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7Cn0= */
          [data-rk] .g5kl0l0 {
            border-color: transparent;
          }

          /* vanilla-extract-css-ns:src/components/ConnectOptions/DesktopOptions.css.ts.vanilla.css?source=Ll8xdnd0MGNnMCB7CiAgYmFja2dyb3VuZDogd2hpdGU7Cn0KLl8xdnd0MGNnMiB7CiAgbWF4LWhlaWdodDogNDU0cHg7CiAgb3ZlcmZsb3cteTogYXV0bzsKfQouXzF2d3QwY2czIHsKICBtaW4td2lkdGg6IDI0NnB4Owp9Ci5fMXZ3dDBjZzQgewogIG1pbi13aWR0aDogMTAwJTsKfQpAbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA3NjhweCkgewogIC5fMXZ3dDBjZzMgewogICAgbWluLXdpZHRoOiAyODdweDsKICB9Cn0= */
          [data-rk] ._1vwt0cg0 {
            background: white;
          }
          [data-rk] ._1vwt0cg2 {
            max-height: 454px;
            overflow-y: auto;
          }
          [data-rk] ._1vwt0cg3 {
            min-width: 246px;
          }
          [data-rk] ._1vwt0cg4 {
            min-width: 100%;
          }
          @media screen and (min-width: 768px) {
            [data-rk] ._1vwt0cg3 {
              min-width: 287px;
            }
          }

          /* vanilla-extract-css-ns:src/components/ConnectOptions/MobileOptions.css.ts.vanilla.css?source=Ll8xYW0xNDQxMCB7CiAgb3ZlcmZsb3c6IGF1dG87CiAgc2Nyb2xsYmFyLXdpZHRoOiBub25lOwogIHRyYW5zZm9ybTogdHJhbnNsYXRlWigwKTsKfQouXzFhbTE0NDEwOjotd2Via2l0LXNjcm9sbGJhciB7CiAgZGlzcGxheTogbm9uZTsKfQ== */
          [data-rk] ._1am14410 {
            overflow: auto;
            scrollbar-width: none;
            transform: translateZ(0);
          }
          [data-rk] ._1am14410::-webkit-scrollbar {
            display: none;
          }

        `,
      },
    },
  });

  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const isConnected = providerService.getIsConnected();
        if (isConnected) {
          const web3Network = await providerService.getNetwork();
          const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
          if (
            (SUPPORTED_NETWORKS.includes(web3Network.chainId) || aggSupportedNetworks.includes(web3Network.chainId)) &&
            !(web3Network as { chainId: number; defaultProvider: boolean }).defaultProvider
          ) {
            dispatch(setNetwork(networkToSet as NetworkStruct));
            if (networkToSet) {
              web3Service.setNetwork(networkToSet?.chainId);
            }
          } else {
            web3Service.setNetwork(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId);
          }
        }
      } catch (e) {
        console.error('Found error while trying to set up network');
      }
      setHasSetNetwork(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(startFetchingTokenLists());
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getNetwork();
  }, [account]);

  const isLoadingNetwork = !currentNetwork || !hasSetNetwork;

  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <SCThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <TransactionModalProvider>
            {!isLoading && !isLoadingNetwork && (
              <>
                <TransactionUpdater />
                <BlockNumberUpdater />
              </>
            )}
            <Router>
              <NavBar isLoading={isLoading || isLoadingNetwork} />
              <FeedbackCard />
              <StyledVector1Container>
                <Vector1 />
              </StyledVector1Container>
              <StyledVector2Container>
                <Vector2 />
              </StyledVector2Container>
              <StyledContainer>
                <StyledGridContainer container direction="row" isSmall={currentBreakPoint === 'xs'}>
                  <StyledAppGridContainer item xs={12}>
                    <ErrorBoundary error={initializationError}>
                      <Switch>
                        <Route path="/faq">
                          {/* <RollbarContext context="/faq"> */}
                          <FAQ />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/positions/:positionId">
                          {/* <RollbarContext context="/positions/details"> */}
                          <PositionDetail />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/:chainId/positions/:positionVersion/:positionId">
                          {/* <RollbarContext context="/positions/details"> */}
                          <PositionDetail />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/jbrl-competition">
                          {/* <RollbarContext context="/leaderboard"> */}
                          <JbrlCompetition />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/positions">
                          {/* <RollbarContext context="/positions"> */}
                          <Home isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/euler-claim">
                          {/* <RollbarContext context="/positions"> */}
                          <EulerClaimFrame isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/create/:chainId?/:from?/:to?">
                          {/* <RollbarContext context="/create"> */}
                          <Home isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                        <Route path="/swap/:chainId?/:from?/:to?">
                          <Aggregator isLoading={isLoading || isLoadingNetwork} />
                        </Route>
                        <Route path="/:chainId?/:from?/:to?">
                          {/* <RollbarContext context="/main"> */}
                          <Home isLoading={isLoading || isLoadingNetwork} />
                          {/* </RollbarContext> */}
                        </Route>
                      </Switch>
                    </ErrorBoundary>
                  </StyledAppGridContainer>
                  <StyledFooterGridContainer item xs={12}>
                    <AppFooter />
                  </StyledFooterGridContainer>
                </StyledGridContainer>
              </StyledContainer>
            </Router>
          </TransactionModalProvider>
        </SnackbarProvider>
      </SCThemeProvider>
    </ThemeProvider>
  );
};
export default AppFrame;
