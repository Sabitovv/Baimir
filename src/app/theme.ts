import { createTheme } from '@mui/material/styles'

export const muiTheme = createTheme({
    typography: {
        fontFamily: 'Manrope, sans-serif',

        h1: {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700
        },
        h2: {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 600
        },
        h3: {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 400
        },

        body1: {
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 400
        },
        body2: {
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500
        },

        subtitle1: {
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600
        },

        button: {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase'
        }
    }
})
