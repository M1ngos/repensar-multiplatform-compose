package org.cooperativa.repensar

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform