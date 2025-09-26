package org.cooperativa.repensar

import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "repensar-multiplatform-compose",
    ) {
        App()
    }
}